import threading
from typing import Dict, List
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

from enums import DescriptionCategory

class KeywordExtractor:
    # Thread-safe class for scoring user input against predefined categories using embeddings.

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(KeywordExtractor, cls).__new__(cls)
                    cls._instance._initialize()
        return cls._instance

    def _initialize(self):


        # Initializing the model and pre-computing category embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

        # Define category keywords for embedding similarity
        self.CATEGORY_KEYWORDS = {
            DescriptionCategory.SCENE: [
                "scene", "setting", "environment", "location", "place", "background", "surroundings", "landscape", "area"
            ],
            DescriptionCategory.ACTIVITY: [
                "activity", "doing", "happening", "action", "movement", "event", "gesture", "interaction"
            ],
            DescriptionCategory.EMOTION: [
                "emotion", "feeling", "mood", "expression", "happy", "sad", "angry", "excited", "peaceful"
            ],
            DescriptionCategory.ATMOSPHERE: [
                "atmosphere", "vibe", "ambiance", "tone", "aura", "general mood", "overall feeling"
            ],
            DescriptionCategory.COLOR: [
                "color", "colors", "hue", "shades", "tints", "tones", "palette", "vivid", "bright", "dark"
            ],
            DescriptionCategory.TEXT: [
                "text", "sign", "words", "writing", "message", "letter", "caption", "label", "read", "say"
            ],
            DescriptionCategory.CONCISENESS: [
                "conciseness", "summary", "summarize", "brief", "short", "concise", "succinct", "overview", "highlight"
            ]
        }

        # Pre-computing and storing the normalized average embeddings for each category
        self.CATEGORY_EMBEDDINGS = {}
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            keyword_embeddings = self.model.encode(keywords, convert_to_tensor=False)
            avg_embedding = np.mean(keyword_embeddings, axis=0)
            norm = np.linalg.norm(avg_embedding)
            normalized_embedding = avg_embedding / norm if norm != 0 else avg_embedding
            self.CATEGORY_EMBEDDINGS[category] = normalized_embedding

    def score_categories(self, user_input: str) -> Dict[DescriptionCategory, float]:
        # Scores user input against all categories:
        if not user_input.strip():
            return {category: 0.0 for category in self.CATEGORY_EMBEDDINGS}

        # Encoding and normalizing the user input
        input_embedding = self.model.encode([user_input], convert_to_tensor=False)[0]
        norm = np.linalg.norm(input_embedding)
        input_embedding = input_embedding / norm if norm != 0 else input_embedding

        scores = {}
        for category, embedding in self.CATEGORY_EMBEDDINGS.items():
            similarity = cosine_similarity(
                input_embedding.reshape(1, -1),
                embedding.reshape(1, -1)
            )[0][0]
            scores[category] = float(similarity)

        return scores


def test_scoring():
    keyword_extractor = KeywordExtractor()

    test_cases = [
        # Scene Category (10 test cases)
        ("What's happening in the picture?", DescriptionCategory.SCENE),
        ("Describe the environment.", DescriptionCategory.SCENE),
        ("Where is this scene taking place?", DescriptionCategory.SCENE),
        ("Can you describe the surroundings?", DescriptionCategory.SCENE),
        ("What's the setting of this image?", DescriptionCategory.SCENE),
        ("Is it indoors or outdoors?", DescriptionCategory.SCENE),
        ("What can you tell me about the location?", DescriptionCategory.SCENE),
        ("Describe the background elements.", DescriptionCategory.SCENE),
        ("What's the landscape like?", DescriptionCategory.SCENE),
        ("Can you tell me about the area?", DescriptionCategory.SCENE),

        # Activities Category (10 test cases)
        ("What are the people doing?", DescriptionCategory.ACTIVITY),
        ("Is there any movement happening?", DescriptionCategory.ACTIVITY),
        ("Describe any actions occurring.", DescriptionCategory.ACTIVITY),
        ("Are there any interactions between individuals?", DescriptionCategory.ACTIVITY),
        ("What events are taking place?", DescriptionCategory.ACTIVITY),
        ("What's going on in the image?", DescriptionCategory.ACTIVITY),
        ("Are any sports being played?", DescriptionCategory.ACTIVITY),
        ("What kind of activities are visible?", DescriptionCategory.ACTIVITY),
        ("Is anyone engaged in a task?", DescriptionCategory.ACTIVITY),
        ("Can you describe the motion in the scene?", DescriptionCategory.ACTIVITY),

        # Emotions Category (10 test cases)
        ("How are the people feeling?", DescriptionCategory.EMOTION),
        ("Describe the emotions shown.", DescriptionCategory.EMOTION),
        ("What expressions do you see?", DescriptionCategory.EMOTION),
        ("Are they happy or sad?", DescriptionCategory.EMOTION),
        ("Can you tell if they are excited?", DescriptionCategory.EMOTION),
        ("Do they look surprised?", DescriptionCategory.EMOTION),
        ("Is anyone laughing or crying?", DescriptionCategory.EMOTION),
        ("What's the emotional state of the characters?", DescriptionCategory.EMOTION),
        ("Can you sense any feelings?", DescriptionCategory.EMOTION),
        ("How does everyone seem emotionally?", DescriptionCategory.EMOTION),

        # Atmosphere Category (10 test cases)
        ("What's the overall atmosphere?", DescriptionCategory.ATMOSPHERE),
        ("Describe the vibe of the scene.", DescriptionCategory.ATMOSPHERE),
        ("What's the general mood here?", DescriptionCategory.ATMOSPHERE),
        ("Does the setting feel tense or relaxed?", DescriptionCategory.ATMOSPHERE),
        ("Is there a festive atmosphere?", DescriptionCategory.ATMOSPHERE),
        ("Does it seem calm or chaotic?", DescriptionCategory.ATMOSPHERE),
        ("What's the tone of the image?", DescriptionCategory.ATMOSPHERE),
        ("How would you describe the ambiance?", DescriptionCategory.ATMOSPHERE),
        ("What's the feel of the setting?", DescriptionCategory.ATMOSPHERE),
        ("Is there a particular mood conveyed?", DescriptionCategory.ATMOSPHERE),

        # Colors Category (10 test cases)
        ("Describe the colors in the image.", DescriptionCategory.COLOR),
        ("What are the dominant hues?", DescriptionCategory.COLOR),
        ("Are there any bright colors?", DescriptionCategory.COLOR),
        ("Is the picture colorful?", DescriptionCategory.COLOR),
        ("Can you tell me about the color palette?", DescriptionCategory.COLOR),
        ("What colors stand out the most?", DescriptionCategory.COLOR),
        ("Are the colors warm or cool?", DescriptionCategory.COLOR),
        ("Do any shades catch your eye?", DescriptionCategory.COLOR),
        ("Is the image vivid or dull?", DescriptionCategory.COLOR),
        ("How would you describe the tones?", DescriptionCategory.COLOR),

        # Text Category (10 test cases)
        ("Is there any text visible?", DescriptionCategory.TEXT),
        ("Can you read any signs?", DescriptionCategory.TEXT),
        ("What does the writing say?", DescriptionCategory.TEXT),
        ("Are there any words displayed?", DescriptionCategory.TEXT),
        ("Is there a caption or label?", DescriptionCategory.TEXT),
        ("What does the billboard say?", DescriptionCategory.TEXT),
        ("Are there any warnings posted?", DescriptionCategory.TEXT),
        ("Can you see any written messages?", DescriptionCategory.TEXT),
        ("Is there any lettering present?", DescriptionCategory.TEXT),
        ("Are there any posters with text?", DescriptionCategory.TEXT),

        # Conciseness Category (10 test cases)
        ("Can you summarize the image briefly?", DescriptionCategory.CONCISENESS),
        ("Please provide a short description.", DescriptionCategory.CONCISENESS),
        ("Give me a quick overview.", DescriptionCategory.CONCISENESS),
        ("Can you keep it concise?", DescriptionCategory.CONCISENESS),
        ("Summarize what you see.", DescriptionCategory.CONCISENESS),
        ("I prefer a brief explanation.", DescriptionCategory.CONCISENESS),
        ("Just tell me the main points.", DescriptionCategory.CONCISENESS),
        ("Please be succinct in your description.", DescriptionCategory.CONCISENESS),
        ("Can you make it short and to the point?", DescriptionCategory.CONCISENESS),
        ("How about a condensed version?", DescriptionCategory.CONCISENESS),
    ]

    total_score = 0
    n_categories = len(keyword_extractor.CATEGORY_KEYWORDS)
    n_test_cases = len(test_cases)

    for i, (input_text, expected_category) in enumerate(test_cases, 1):
        scores = keyword_extractor.score_categories(input_text)
        sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        expected_index = next(
            (index for index, (category, _) in enumerate(sorted_scores) if category == expected_category),
            None
        )
        category_score = (n_categories - expected_index) / n_categories if expected_index is not None else 0
        total_score += category_score

        # Print results for each test case
        print(f"Test Case {i}: {input_text}")
        print(f"Expected Category: {expected_category.name} (Index: {expected_index + 1 if expected_index is not None else 'Not found'})")
        print(f"Category Score for this test case: {category_score:.2f}\n")

    # Calculate and print final accuracy
    final_accuracy = (total_score / n_test_cases) * 100
    print(f"Final Accuracy: {final_accuracy:.2f}%")

if __name__ == "__main__":
    test_scoring()
