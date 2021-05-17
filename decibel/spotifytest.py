import spotipy
import json
import unidecode as unidecode
from spotipy.oauth2 import SpotifyClientCredentials
from youtubesearchpython import VideosSearch


#Procura a música no spotify usando sua WEB API
cred = spotipy.SpotifyClientCredentials(client_id='c6214adf8f724671b938c0da9bf2bb47', client_secret='1bf9e0d2042e488c91231ea0f93e1302')
spotify = spotipy.Spotify(client_credentials_manager=cred)

def search(song):
    busca = song
    results = spotify.search(busca)
    main_result = results["tracks"]["items"][0]
    videosSearch = VideosSearch(main_result["name"], limit=2)
    return [main_result["name"], videosSearch.result()["result"][0]["link"], main_result["artists"][0]["name"]]

def cifra_clubify(song, artist):
    url = 'https://cifraclub.com.br/'
    artist = normalize(artist)
    song = normalize(song)
    song = song.split("---")[0]
    url += artist + '/'
    url += song
    return url

def normalize(str):
    str = str.lower()
    str = str.replace(' ', '-')
    str = str.replace('&', 'e')
    str = unidecode.unidecode(str)
    return str