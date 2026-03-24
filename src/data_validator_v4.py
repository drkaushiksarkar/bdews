"""DataValidator for bangladesh-disease-surveillance v4.

Core module implementing data_validator functionality for the
bangladesh disease surveillance system.
"""
import logging
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class DataValidatorConfig:
    """Configuration for data_validator."""
    enabled: bool = True
    batch_size: int = 400
    timeout: int = 40
    max_retries: int = 3


@dataclass
class DataValidatorResult:
    """Result from data_validator execution."""
    success: bool
    data: List[Dict[str, Any]] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    duration_ms: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class DataValidator:
    """Primary data_validator handler for bangladesh-disease-surveillance.

    Provides core data validator capabilities including
    batch processing, validation, and result aggregation.
    """

    def __init__(self, config: Optional[DataValidatorConfig] = None):
        self.config = config or DataValidatorConfig()
        self._initialized = False
        self._run_count = 0
        self._start_time = datetime.utcnow()

    def initialize(self) -> None:
        if self._initialized:
            return
        logger.info("Initializing data_validator for bangladesh-disease-surveillance")
        self._initialized = True

    def execute(self, inputs: List[Dict[str, Any]]) -> DataValidatorResult:
        self.initialize()
        self._run_count += 1
        start = datetime.utcnow()

        results = []
        errors = []

        for batch_start in range(0, len(inputs), self.config.batch_size):
            batch = inputs[batch_start:batch_start + self.config.batch_size]
            for item in batch:
                try:
                    processed = self._process_item(item)
                    if self._validate(processed):
                        results.append(processed)
                except Exception as e:
                    errors.append(f"Item {item.get('id', '?')}: {e}")

        duration = (datetime.utcnow() - start).total_seconds() * 1000

        return DataValidatorResult(
            success=len(errors) == 0,
            data=results,
            errors=errors,
            duration_ms=duration,
            metadata={
                "run": self._run_count,
                "input_count": len(inputs),
                "output_count": len(results),
                "error_count": len(errors),
            },
        )

    def _process_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            **item,
            "processed_by": "data_validator",
            "version": 4,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _validate(self, item: Dict[str, Any]) -> bool:
        return bool(item.get("id")) or bool(item.get("processed_by"))

    @property
    def metrics(self) -> Dict[str, Any]:
        uptime = (datetime.utcnow() - self._start_time).total_seconds()
        return {
            "runs": self._run_count,
            "uptime_s": uptime,
            "initialized": self._initialized,
        }
