from app.services.vision import normalize_value


def test_normalize_email() -> None:
    assert normalize_value("user_email", "  A@B.COM ") == "a@b.com"
