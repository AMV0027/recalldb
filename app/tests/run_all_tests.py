"""
Run all unit and regression test suites for RecallDB.
"""

import unittest
import sys
from pathlib import Path

# Add app to path
app_dir = Path(__file__).resolve().parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))


def suite():
    loader = unittest.TestLoader()
    s = unittest.TestSuite()
    s.addTests(loader.discover(start_dir=str(Path(__file__).parent), pattern="test_*.py"))
    return s


if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite())
    sys.exit(0 if result.wasSuccessful() else 1)
