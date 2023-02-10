import os
import threading
import json
from flask import Flask, render_template, request, jsonify, url_for
from .img2img import WD, SD

def create_app(test_config=None):
  app = Flask(__name__, instance_relative_config=True)
  app.config.from_mapping(
    SECRET_KEY='dev',
  )

  if test_config is None:
    app.config.from_pyfile('config.py', silent=True)
  else:
    app.config.from_mapping(test_config)

  app.config['UPLOAD_FOLDER'] = "./uploads"

  try:
    os.makedirs(app.instance_path)
  except OSError:
    pass

  wd = WD()
  sd = SD()

  @app.route("/", methods=["GET"])
  def index():
    return render_template('index.html')


  @app.route("/img2img/upload", methods=["POST"])
  def img2img():
    if request.method == 'POST':
      input_file_name = os.path.join(app.config['UPLOAD_FOLDER'], "input.png")
      output_file_name = "./sdui/static/imgs/output.png"
      data = json.loads(request.form.get('data'))
      file = request.files['input_img']
      file.save(input_file_name)

      if os.path.isfile(output_file_name):
        os.remove(output_file_name)

      def run():
        i2i = sd
        if 'model_name' in data and data['model_name'] == 'waifu':
          i2i = wd

        i2i.run(
          data['prompt'],
          input_file_name,
          output_file_name,
          strength=float(data['strength'])
        )

      threading.Thread(target=run).start()

    return jsonify({"message": "succeeded"}), 200

  return app
