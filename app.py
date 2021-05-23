import glob
import io
import os
import uuid

import decibel.spotifytest as sp
import decibel.framework as fw
import numpy as np
from flask import Flask, jsonify, make_response, render_template, request
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure

app = Flask(__name__)
app.secret_key = "s3cr3t"
app.debug = False
app._static_folder = os.path.abspath("templates/static/")
datalistglobal = []

#Renderiza página principal
@app.route("/", methods=["GET"])
def index():
    title = "Moises - Chord Detection"
    return render_template("layouts/index.html", title=title)

#Pega o input da pagina principal
@app.route('/', methods=['POST'])
def my_form_post():
    title = "Moises - Chord Detection"
    text = request.form['text']
    datalistglobal.clear()
    #print(sp.search(processed_text))
    resultado = sp.searchHtml(text)
    datalist = [resultado]
    datalistglobal.append(resultado)
    #Desenvolver a exibição de resultados de pesquisa na página results.html
    """
    for csv in glob.iglob("images/*.csv"):
        datalist.append(get_file_content(csv))
    """
    return render_template("layouts/results.html", title=title, datalist=datalist)

@app.route("/database/", methods=["GET"])
def database():
    title = "Results"
    datalist = []
    for json in glob.iglob("Data/results/Labs/Output/*.json"):
        datalist.append(json)
    return render_template("layouts/database.html", title=title, datalist=datalist)


@app.route("/results/<unique_id>", methods=["GET"])
def result_for_uuid(unique_id):
    title = "Result"
    data = get_file_content(get_file_name(unique_id))
    return render_template("layouts/result.html", title=title, data=data)


@app.route("/postmethod", methods=["POST"])
def post_javascript_data():
    jsdata = request.form["canvas_data"]
    unique_id = create_csv(jsdata)
    params = {"unique_id": unique_id}
    return jsonify(params)

@app.route("/results", methods=["POST"])
def contact():
        if request.form['submit_button'] == 'Select Option 1':
            song = datalistglobal[0][0][4]
            artist = datalistglobal[0][0][5]
            urltab = sp.cifra_clubify(song, artist)
            urlsong = datalistglobal[0][0][2]
            if urlsong != '' and urltab != '':
                fw.predictSong(urlsong, urltab)
        elif request.form['submit_button'] == 'Select Option 2':
            song = datalistglobal[0][1][4]
            artist = datalistglobal[0][1][5]
            urltab = sp.cifra_clubify(song, artist)
            urlsong = datalistglobal[0][1][2]
            if urlsong != '' and urltab != '':
                fw.predictSong(urlsong, urltab)
        elif request.form['submit_button'] == 'Select Option 3':
            song = datalistglobal[0][2][4]
            artist = datalistglobal[0][2][5]
            urltab = sp.cifra_clubify(song, artist)
            urlsong = datalistglobal[0][2][2]
            if urlsong != '' and urltab != '':
                fw.predictSong(urlsong, urltab)
        return render_template('layouts/result.html')

@app.route("/plot/<imgdata>")
def plot(imgdata):
    data = [float(i) for i in imgdata.strip("[]").split(",")]
    data = np.reshape(data, (200, 200))
    fig = Figure()
    axis = fig.add_subplot(1, 1, 1)
    axis.axis("off")
    axis.imshow(data, interpolation="nearest")
    canvas = FigureCanvas(fig)
    output = io.BytesIO()
    canvas.print_png(output)
    response = make_response(output.getvalue())
    response.mimetype = "image/png"
    return response


def create_csv(text):
    unique_id = str(uuid.uuid4())
    with open(get_file_name(unique_id), "a") as file:
        file.write(text[1:-1] + "\n")
    return unique_id


def get_file_name(unique_id):
    return f"Data/results/Labs/Output/{unique_id}"


def get_file_content(filename):
    with open(filename, "r") as file:
        return file.read()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
