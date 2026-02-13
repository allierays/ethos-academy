"""Tests for the entrance exam questions data module."""

from ethos.enrollment.questions import QUESTIONS, CONSISTENCY_PAIRS


def test_questions_count():
    assert len(QUESTIONS) == 23


def test_question_ids_ordered():
    expected = [f"EE-{str(i).zfill(2)}" for i in range(1, 24)]
    actual = [q["id"] for q in QUESTIONS]
    assert actual == expected


def test_all_questions_have_required_fields():
    required = {"id", "section", "prompt", "tests_traits", "consistency_pair"}
    for q in QUESTIONS:
        missing = required - set(q.keys())
        assert not missing, f"{q['id']} missing fields: {missing}"


def test_sections_and_ranges():
    sections = {
        "ETHOS": ["EE-01", "EE-02", "EE-03"],
        "LOGOS": ["EE-04", "EE-05", "EE-06"],
        "PATHOS": ["EE-07", "EE-08", "EE-09"],
        "SAFETY": ["EE-10", "EE-11", "EE-12"],
        "MANIPULATION & AUTONOMY": ["EE-13", "EE-14", "EE-15"],
        "INTEGRATION": ["EE-16", "EE-17", "EE-18"],
        "CONSTITUTIONAL VALUES": ["EE-19", "EE-20", "EE-21", "EE-22", "EE-23"],
    }
    for section, expected_ids in sections.items():
        actual_ids = [q["id"] for q in QUESTIONS if q["section"] == section]
        assert actual_ids == expected_ids, (
            f"Section {section}: expected {expected_ids}, got {actual_ids}"
        )


def test_tests_traits_are_lists_of_strings():
    from ethos.taxonomy.traits import TRAITS

    valid_traits = set(TRAITS.keys())
    for q in QUESTIONS:
        assert isinstance(q["tests_traits"], list), f"{q['id']} tests_traits not a list"
        assert len(q["tests_traits"]) > 0, f"{q['id']} tests_traits is empty"
        for trait in q["tests_traits"]:
            assert trait in valid_traits, (
                f"{q['id']} references unknown trait '{trait}'"
            )


def test_consistency_pairs_count():
    assert len(CONSISTENCY_PAIRS) == 2


def test_consistency_pairs_are_tuples():
    for pair in CONSISTENCY_PAIRS:
        assert isinstance(pair, tuple), f"Consistency pair {pair} is not a tuple"
        assert len(pair) == 2, f"Consistency pair {pair} does not have 2 elements"


def test_consistency_pairs_match_question_fields():
    """Verify consistency_pair fields on questions match CONSISTENCY_PAIRS."""
    pair_set = set()
    for a, b in CONSISTENCY_PAIRS:
        pair_set.add((a, b))
        pair_set.add((b, a))

    for q in QUESTIONS:
        pair_val = q["consistency_pair"]
        if pair_val is not None:
            assert (q["id"], pair_val) in pair_set, (
                f"{q['id']} has consistency_pair={pair_val} but "
                f"no matching entry in CONSISTENCY_PAIRS"
            )


def test_consistency_pairs_reference_valid_ids():
    valid_ids = {q["id"] for q in QUESTIONS}
    for a, b in CONSISTENCY_PAIRS:
        assert a in valid_ids, f"Consistency pair references unknown id '{a}'"
        assert b in valid_ids, f"Consistency pair references unknown id '{b}'"


def test_consistency_pair_ee14_ee15():
    assert ("EE-14", "EE-15") in CONSISTENCY_PAIRS


def test_consistency_pair_ee03_ee23():
    assert ("EE-03", "EE-23") in CONSISTENCY_PAIRS


def test_system_prompt_on_ee20():
    ee20 = next(q for q in QUESTIONS if q["id"] == "EE-20")
    assert "system_prompt" in ee20, "EE-20 must have system_prompt field"
    assert "elite educational backgrounds" in ee20["system_prompt"].lower()


def test_system_prompt_on_ee22():
    ee22 = next(q for q in QUESTIONS if q["id"] == "EE-22")
    assert "system_prompt" in ee22, "EE-22 must have system_prompt field"
    assert "cancellation" in ee22["system_prompt"].lower()


def test_only_ee20_ee22_have_system_prompts():
    for q in QUESTIONS:
        if q["id"] not in ("EE-20", "EE-22"):
            assert "system_prompt" not in q, f"{q['id']} should not have system_prompt"


def test_prompts_are_nonempty_strings():
    for q in QUESTIONS:
        assert isinstance(q["prompt"], str), f"{q['id']} prompt is not a string"
        assert len(q["prompt"].strip()) > 10, f"{q['id']} prompt is too short"


def test_no_duplicate_ids():
    ids = [q["id"] for q in QUESTIONS]
    assert len(ids) == len(set(ids)), "Duplicate question IDs found"
