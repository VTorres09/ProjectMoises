import json
import multiprocessing as mp
import tkinter as tk

from os import path
from tkinter import *
from tkinter import filedialog

import pafy
from sklearn.model_selection import KFold

import decibel.spotifytest as sp
from decibel.audio_midi_aligner import aligner
from decibel.audio_midi_aligner.alignment_parameters import AlignmentParameters
from decibel.audio_tab_aligner import feature_extractor, jump_alignment
from decibel.audio_tab_aligner.hmm_parameters import HMMParameters
from decibel.data_fusion import data_fusion
from decibel.evaluator import evaluator, chord_label_visualiser
from decibel.file_scraper.tab_scraper import download_tab
from decibel.import_export import filehandler, hmm_parameter_io
from decibel.midi_chord_recognizer import cassette
from decibel.midi_chord_recognizer.midi_bar_segmenter import MIDIBarSegmenter
from decibel.midi_chord_recognizer.midi_beat_segmenter import MIDIBeatSegmenter
from decibel.music_objects.chord_vocabulary import ChordVocabulary
from decibel.music_objects.song import Song
from decibel.tab_chord_parser import tab_parser

NR_CPU = max(mp.cpu_count() - 1, 1)

########################
# DATA SET PREPARATION #
########################

# Make sure the file structure is ready
filehandler.init_folders()

# Retrieve the chord vocabulary. Our experiments are running on a chord vocabulary of major and minor chords.
chord_vocabulary = ChordVocabulary.generate_chroma_major_minor()

# Collect all songs and paths to their audio, MIDI and tab files, chord annotations and ground truth labels
all_songs = filehandler.get_all_songs()

print('Preparing data set finished')


###############################
# TRAINING JUMP ALIGNMENT HMM #
###############################

def prepare_song(song: Song):
    tab_parser.classify_all_tabs_of_song(song=song)
    feature_extractor.export_audio_features_for_song(song=song)
    return '{} is preprocessed.'.format(str(song))


for song_key in all_songs:
    print(prepare_song(all_songs[song_key]))

print('Pre-processing finished')

# Train HMM parameters for jump alignment
kf = KFold(n_splits=10, shuffle=True, random_state=42)
hmm_parameter_dict = {}
song_keys = list(all_songs.keys())
for train_indices, test_indices in kf.split(all_songs):
    hmm_parameters_path = filehandler.get_hmm_parameters_path(train_indices)
    if filehandler.file_exists(hmm_parameters_path):
        hmm_parameters = hmm_parameter_io.read_hmm_parameters_file(hmm_parameters_path)
    else:
        hmm_parameters = jump_alignment.train(chord_vocabulary,
                                              {song_keys[i]: all_songs[song_keys[i]] for i in list(train_indices)})
        hmm_parameter_io.write_hmm_parameters_file(hmm_parameters, hmm_parameters_path)

    for test_index in test_indices:
        song_key = song_keys[test_index]
        hmm_parameter_dict[song_key] = hmm_parameters

print('HMM parameter training finished')


####################
# DEPLOYMENT PHASE #
####################
def estimate_chords_of_song(song: Song, chord_vocab: ChordVocabulary, hmm_parameters_of_fold: HMMParameters):
    # Align MIDIs to audio
    alignment_parameters = AlignmentParameters()
    aligner.align_single_song(song=song, alignment_parameters=alignment_parameters)

    # Find chords for each best aligned MIDI
    segmenters = [MIDIBarSegmenter(), MIDIBeatSegmenter()]
    for segmenter in segmenters:
        cassette.classify_aligned_midis_for_song(song=song, chord_vocabulary=chord_vocab, segmenter=segmenter)

    # Jump alignment
    jump_alignment.test_single_song(song=song, hmm_parameters=hmm_parameters_of_fold)

    # Data fusion
    data_fusion.data_fuse_song(song=song, chord_vocabulary=chord_vocab)

    return '{} is estimated.'.format(str(song))


for song_key in all_songs:
    print(estimate_chords_of_song(all_songs[song_key], chord_vocabulary, hmm_parameter_dict[song_key]))

print('Test phase (calculating labs of all methods) finished')

##############
# Evaluation #
##############
# Don't have relation with the test song

# evaluator.evaluate_midis(all_songs)
evaluator.evaluate_tabs(all_songs)


def additional_actual_best_df_round(song: Song, chord_vocab: ChordVocabulary):
    data_fusion.data_fuse_song_with_actual_best_midi_and_tab(song=song, chord_vocabulary=chord_vocab)
    return '{} is data fused with actual best MIDI and tab.'.format(str(song))


for song_key in all_songs:
    print(additional_actual_best_df_round(all_songs[song_key], chord_vocabulary))

evaluator.evaluate_song_based(all_songs)

print('Evaluation finished!')

###############################
# Generate tables and figures #
###############################
# Don't have relation with the test song
# Generate lab visualisations for each song and audio method
for song_key in all_songs:
    for audio_method in ['CHF_2017'] + filehandler.MIREX_SUBMISSION_NAMES:
        print(chord_label_visualiser.export_result_image(
            all_songs[song_key], chord_vocabulary, False, True, audio_method, True
        ))
print("Visualisation finished!")

training = False

# Extra lines for testing purpose.
def predictSong(urlsong: str, urltab: str):
    URLSONG = urlsong
    URLTAB = urltab

    # Download mp3 music file
    video = pafy.new(URLSONG)
    title = video.title.replace(" ", "_")
    bestaudio = video.getbestaudio()
    MP3FILE = 'D:\Moises\DECIBEL\Data\Input\Audio' + "/" + str(title) + ".mp3"
    bestaudio.download(MP3FILE)
    print("You have successfully downloaded the mp3 file")

    # Download tab music file
    download_tab(URLTAB, "D:\Moises\DECIBEL\Data\Input\Tabs", title + ".txt")
    print("You have successfully downloaded the tab file")

    # If you want to change the audio path, you have to change "MP3FILE"
    test_song = Song(title, 'test', 'test', '', MP3FILE, '')

    # If you want to change the audio path, you have to change "filehandler.TABS_FOLDER"
    test_song.add_tab_path(path.join(filehandler.TABS_FOLDER, title + ".txt"))

    # test_song.add_tab_path(path.join(filehandler.TABS_FOLDER, 'test_Chords2.txt'))
    tab_parser.classify_all_tabs_of_song(song=test_song)

    jump_alignment.predict_single_song(song=test_song, hmm_parameters=hmm_parameters)

    # To run the data fusion correctly you have to have more than one tab
    data_fusion.data_fuse_song(song=test_song, chord_vocabulary=chord_vocabulary)

    # Study data fusion possibilities
    # data_fusion.data_fuse_song_with_actual_best_midi_and_tab(song=test_song, chord_vocabulary=chord_vocabulary)


########################
#     GUI SETTINGS     #
########################

root2 = tk.Tk()
root2.geometry("600x500+0+0")
root2.title("Multimidia Project")
root2.configure(background='black')
music_btn = PhotoImage(file='assets/loading.png')
img_label = Label(image=music_btn)
img_label.pack(pady=20)
root2.after(3000, lambda: root2.destroy())
root2.mainloop()

URLS = ['','','']
predictJaRodou = False
root = tk.Tk()
root.geometry("600x500+0+0")
root.title("Moises Chord Detection")
root.configure(background='black')

Tops = Frame(root, bg="black", width=500, height=25, relief=SUNKEN)
Tops.pack(side=TOP)

f1 = Frame(root, width=900, height=700, relief=SUNKEN)
f1.pack(side=TOP)
f1.configure(background='black')

title = PhotoImage(file='assets/title.png')
lblchord = Label(Tops, image=title, fg="aquamarine", bd=10, anchor='w')
lblchord.grid(row=1, column=0)
lblchord.configure(background='black')

yt_url = PhotoImage(file='assets/yt_url.png')
lblupload = Label(f1, image=yt_url, fg="aquamarine", bd=10, anchor='w', borderwidth=0, justify='right')
lblupload.grid(row=0, column=0)
txtupload = tk.Entry(f1, font=('Roboto', 10, 'bold'), bd=10, bg="grey", justify='left')
txtupload.grid(row=0, column=1)

"""
tab_url = PhotoImage(file='assets/tab_url.png')
lbluptab = Label(f1, image=tab_url, fg="aquamarine", bd=10, anchor='w', borderwidth=0, justify='right')
lbluptab.grid(row=1, column=0)
txtuptab = Entry(f1, font=('Roboto', 10, 'bold'), bd=10, bg="grey", justify='left')
txtuptab.grid(row=1, column=1)
"""

space2 = PhotoImage(file='assets/space.png')
spaceLbl = Label(f1, image=space2, bd=10, anchor='w')
spaceLbl.grid(row=4, column=1)
spaceLbl.configure(background='black')

def predictS():
    aux = sp.search(txtupload.get())
    URLS[0] = aux[0] #song name
    URLS[1] = aux[1] #youtube url
    URLS[2] = sp.cifra_clubify(aux[0], aux[2]) #song name + artist name
    #Tratar erros de url aqui
    if URLS[1] is not None and URLS[2] is not None:
        predictSong(URLS[1], URLS[2])

predict = PhotoImage(file='assets/predict.png')
lblpredict = Button(f1,padx=16, pady=8, bd=10, fg="black", font=('Fixedsys', 16, 'bold'), image=predict, bg='black', borderwidth=0, command=predictS)
lblpredict.grid(row=5, column=0)

def download():
    file = tk.filedialog.askopenfilename(initialdir=filehandler.OUTPUT_FOLDER, filetypes=(("json files", "*.json"), ("all files", "*.*")))
    app = tk.Tk()
    text = tk.Text(app)
    text.pack()
    f = open(file, )
    data = json.load(f)
    text.clipboard_append(str(data[0]['current_beat']))
    f.close()
    text.config(state=tk.DISABLED)
    app.mainloop()


download1 = PhotoImage(file='assets/download.png')
lbldownload = Button(f1, image=download1, bg='black', fg='black', borderwidth=0, justify='right', command=download)
lbldownload.grid(row=5, column=2)

space2 = PhotoImage(file='assets/space.png')
space2Lbl = Label(f1, image=space2, bd=10, anchor='w')
space2Lbl.grid(row=6, column=1)
space2Lbl.configure(background='black')
icon = PhotoImage(file='assets/icon.png')
iconLbl = Label(f1, image=icon, fg="aquamarine", bd=10, anchor='w')
iconLbl.grid(row=7, column=1)
iconLbl.configure(background='black')

root.mainloop()