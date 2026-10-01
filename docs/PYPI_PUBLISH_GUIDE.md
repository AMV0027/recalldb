# Publishing RecallDB to PyPI Guide

This document describes how to build, verify, and publish the `recalldb` package to the Python Package Index (PyPI).

---

## 1. Prerequisites

Ensure you have a PyPI account and an API token configured.
Install the official packaging tools:

```bash
pip install --upgrade build twine
```

---

## 2. Package Architecture & Clean Builds

RecallDB follows modern PEP 517 / PEP 621 packaging specifications configured in `pyproject.toml`.

### Step 1: Clean Previous Distribution Artifacts
```bash
# In PowerShell:
Remove-Item -Recurse -Force dist/, build/, app/*.egg-info -ErrorAction SilentlyContinue

# In Bash:
rm -rf dist/ build/ app/*.egg-info
```

### Step 2: Build Source Distribution & Binary Wheel
```bash
python -m build
```
This generates:
- `dist/recalldb-0.1.0.tar.gz` (Source Archive)
- `dist/recalldb-0.1.0-py3-none-any.whl` (Universal Pure Python Wheel)

### Step 3: Validate Metadata with Twine
```bash
twine check dist/*
```
Expected output:
```
Checking dist/recalldb-0.1.0-py3-none-any.whl: PASSED
Checking dist/recalldb-0.1.0.tar.gz: PASSED
```

---

## 3. Local Verification Before Publishing

Before pushing to PyPI, test installation in a clean environment:

```bash
pip install dist/recalldb-0.1.0-py3-none-any.whl --force-reinstall
```

Verify in Python:
```python
import recalldb

db = recalldb.connect("verify.db")
db.remember("Test verification fact")
assert len(db.recall("Test")) == 1
print("RecallDB distribution verified successfully!")
```

---

## 4. Uploading to TestPyPI (Recommended First Step)

TestPyPI lets you verify package rendering and installation without affecting the production registry:

```bash
twine upload --repository testpypi dist/*
```
When prompted:
- Username: `__token__`
- Password: `<your-testpypi-api-token>`

Test installing from TestPyPI:
```bash
pip install --index-url https://test.pypi.org/simple/ --no-deps recalldb
```

---

## 5. Publishing to Production PyPI

Once verified on TestPyPI:

```bash
twine upload dist/*
```
When prompted:
- Username: `__token__`
- Password: `<your-pypi-api-token>`

The package will immediately become installable worldwide via:
```bash
pip install recalldb
```

---

## 6. Automated GitHub Actions CI/CD Pipeline

To automatically publish on every GitHub Release, create `.github/workflows/publish.yml`:

```yaml
name: Publish to PyPI

on:
  release:
    types: [published]

jobs:
  pypi-publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Mandatory for Trusted Publishing
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install build tools
        run: pip install build
      - name: Build distributions
        run: python -m build
      - name: Publish package distributions to PyPI
        uses: pypa/gh-action-pypi-publish@release/v1
```
