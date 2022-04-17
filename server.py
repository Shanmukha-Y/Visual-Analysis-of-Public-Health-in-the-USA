from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS, cross_origin

app = Flask(__name__)
# app.config['JSON_SORT_KEYS'] = False
CORS(app, support_credentials=True)

@app.route("/")
def index():
    return render_template('index.html')



    

if __name__ == "__main__":
    print("Running the Main Method")
    app.run(host='127.0.0.1', port=5050, debug=True)