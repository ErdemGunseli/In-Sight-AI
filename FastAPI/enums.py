from enum import Enum


class MessageType(Enum):
    USER = "user"
    SYSTEM = "system"
    ASSISTANT = "assistant"


class DescriptionCategory(Enum):
    SCENE = "SCENE"
    PEOPLE = "PEOPLE"
    ACTIVITY = "ACTIVITY"
    EMOTION = "EMOTION"
    ATMOSPHERE = "ATMOSPHERE"
    COLOR = "COLOR"
    TEXT = "TEXT"
    OBJECTS = "OBJECTS"
    DETAIL = "DETAIL"
    CONCISENESS = "CONCISENESS"


class MessageFeedback(Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class AIModel(Enum):
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"


class TTSModel(Enum):
    OPENAI = 'openai'
    NEUPHONIC = 'neuphonic'


class OpenAIVoice(Enum):
    ALLOY = 'alloy'
    ECHO = 'echo'
    FABLE = 'fable'
    ONYX = 'onyx'
    NOVA = 'nova'
    SHIMMER = 'shimmer'
