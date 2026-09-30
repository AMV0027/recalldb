from setuptools import setup, find_packages

setup(
    name="recalldb",
    version="0.1.0",
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
