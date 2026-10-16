from setuptools import setup, find_packages

setup(
    name="recalldb-ai",
    version="0.2.0",
    package_dir={"": "app"},
    packages=find_packages(where="app"),
    package_data={
        "recalldb.storage": ["*.sql"],
    },
    include_package_data=True,
    install_requires=[
        "numpy>=1.24.0",
    ],
    entry_points={
        "console_scripts": [
            "recalldb=recalldb.cli.main:main",
            "membench=recalldb.bench.cli:main",
        ],
    },
)
