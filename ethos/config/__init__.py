"""Config domain — configuration, priorities, and thresholds."""

from ethos.config.config import EthosConfig
from ethos.config.priorities import PRIORITY_THRESHOLDS, get_threshold

__all__ = [
    "EthosConfig",
    "PRIORITY_THRESHOLDS",
    "get_threshold",
]
