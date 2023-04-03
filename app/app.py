from typing import List, Callable

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageFilter, ImageOps
from google.cloud import aiplatform

from utils import (
    add_dims_to_array,
    convert_to_grayscale,
    decode_base64_image_string,
    convert_to_png,
    image_to_numpy_array,
    invert_contrast_image,
    normalize_pixel_values,
    resize_filter_image,
    dilate_image
)


class PreProcessor:
    """A class which preprocesses the data.
    """

    def __init__(self) -> None:
        self.predict_pipeline: List[Callable] = [
            decode_base64_image_string,
            convert_to_png,
            resize_filter_image,
            invert_contrast_image,
            image_to_numpy_array,
            convert_to_grayscale,
            add_dims_to_array,
            normalize_pixel_values
        ]

    def predict_preprocess(self, image: str) -> np.ndarray:
        """Runs the prediction pipeline on an image.
        Args:
            image (str): The input image(s).
        Returns:
            np.ndarray: The preprocessed image(s).
        """
        for job in self.predict_pipeline:
            image = job(image)
        return image  # type: ignore


app = Flask(__name__)
CORS(app)


project = "837887193312"
endpoint_id = "5744745944990089216"
location = "us-west1"

endpoint_name = f'projects/{project}/locations/{location}/endpoints/{endpoint_id}'
endpoint = aiplatform.Endpoint(endpoint_name=endpoint_name)

classes_path_all: str = "all_classes.txt"


def load_classes() -> List[str]:
    """Loads the class names from the specified local path.

    Returns:
        List[str]: A list of class names sorted alphabetically.
    """
    with open(classes_path_all, "r",) as f:
        classes = [class_name.rstrip("\n") for class_name in f]
    return sorted(classes)


class_names = load_classes()


@app.route('/predict', methods=['POST'])
def predict():
    # Parse the image data from the request body
    image_data = request.form['image']
    lol = ImageOps.autocontrast(invert_contrast_image(resize_filter_image(
        convert_to_png(decode_base64_image_string(image_data)))).filter(ImageFilter.SHARPEN))
    lol.save("image.png")
    # TODO: Process the image data and make predictions
    P = PreProcessor()
    processed_image = P.predict_preprocess(image_data)

    result = endpoint.predict(instances=processed_image.tolist()).predictions[0]
    ind = (-np.asarray(result)).argsort()[:5]
    latex = [class_names[x] for x in ind]

    # Return a response with the predicted result
    return jsonify({'result': latex})


if __name__ == '__main__':
    app.run()
