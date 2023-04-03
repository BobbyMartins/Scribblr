import numpy as np
from tensorflow.keras.utils import img_to_array 
import cv2
from tensorflow.keras.utils import to_categorical

image_dims: Tuple[int, int] = (28, 28)

def training_reshape_image(
    X_train: np.ndarray, X_test: np.ndarray, y_train: np.ndarray, y_test: np.ndarray
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Reshapes the dataset for training.

    Args:
        X_train (np.ndarray): Train data.
        X_test (np.ndarray): Test data.
        y_train (np.ndarray): Train labels.
        y_test (np.ndarray): Test labels.

    Returns:
        Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]: Reshaped dataset.
    """
    X_train = X_train.reshape(
        X_train.shape[0], image_dims[0], image_dims[1], 1
    )
    X_test = X_test.reshape(
        X_test.shape[0], image_dims[0], image_dims[1], 1
    )
    return X_train, X_test, y_train, y_test


def training_normalize_pixel_values(
    X_train: np.ndarray, X_test: np.ndarray, y_train: np.ndarray, y_test: np.ndarray
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Normalizes the pixel values in the dataset between 0 and 1.

    Args:
        X_train (np.ndarray): Train data.
        X_test (np.ndarray): Test data.
        y_train (np.ndarray): Train labels.
        y_test (np.ndarray): Test labels.

    Returns:
        Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]: The normalized dataset.
    """
    return (
        normalize_pixel_values(X_train),
        normalize_pixel_values(X_test),
        y_train,
        y_test,
    )


def one_hot_encode_labels(
    X_train: np.ndarray, X_test: np.ndarray, y_train: np.ndarray, y_test: np.ndarray
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """One hot encodes the training and testing labels.

    Args:
        X_train (np.ndarray): Train data.
        X_test (np.ndarray): Test data.
        y_train (np.ndarray): Train labels.
        y_test (np.ndarray): Test labels.

    Returns:
        Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]: The one hot encoded (labels) dataset.
    """
    y_train = to_categorical(y_train)
    y_test = to_categorical(y_test)
    return X_train, X_test, y_train, y_test
