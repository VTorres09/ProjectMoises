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
    videosSearch = VideosSearch(main_result["name"], limit=3)
    return [main_result["name"], videosSearch.result()["result"][0]["link"], main_result["artists"][0]["name"]]


def searchHtml(song):
    busca = song
    results = spotify.search(busca)
    main_result = results["tracks"]["items"][0]
    videosSearch = VideosSearch(main_result["name"], limit=3)
    return [[videosSearch.result()["result"][0]['title'], videosSearch.result()["result"][0]["thumbnails"][0]['url'], videosSearch.result()["result"][0]["link"], videosSearch.result()["result"][0]['channel']['name'], main_result["name"], main_result["artists"][0]["name"], videosSearch.result()["result"][0]['id']],
            [videosSearch.result()["result"][1]['title'], videosSearch.result()["result"][1]["thumbnails"][0]['url'], videosSearch.result()["result"][1]["link"], videosSearch.result()["result"][1]['channel']['name'], main_result["name"], main_result["artists"][0]["name"], videosSearch.result()["result"][1]['id']],
             [videosSearch.result()["result"][2]['title'], videosSearch.result()["result"][2]["thumbnails"][0]['url'],videosSearch.result()["result"][2]["link"], videosSearch.result()["result"][2]['channel']['name'], main_result["name"], main_result["artists"][0]["name"], videosSearch.result()["result"][2]['id']]]

def cifra_clubify(song, artist):
    artist = normalize(artist)
    song = normalize(song)
    song = song.split("-")[0]
    song = song.split("(")[0]
    return song +" "+ artist

def normalize(str):
    str = str.lower()
    str = str.replace('&', 'e')
    str = str.replace("'", '')
    str = str.replace(".", '')
    str = str.replace("?", '')
    str = unidecode.unidecode(str)
    return str
