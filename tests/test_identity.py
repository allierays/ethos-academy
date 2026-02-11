"""TDD tests for ethos.identity domain — agent ID hashing."""

import hashlib

import pytest


class TestHashAgentId:
    """hash_agent_id() returns SHA-256 hex digest."""

    def test_returns_string(self):
        from ethos.identity.hashing import hash_agent_id
        result = hash_agent_id("agent-001")
        assert isinstance(result, str)

    def test_returns_sha256_hex(self):
        from ethos.identity.hashing import hash_agent_id
        result = hash_agent_id("agent-001")
        assert len(result) == 64  # SHA-256 hex digest is 64 chars

    def test_matches_known_sha256(self):
        from ethos.identity.hashing import hash_agent_id
        expected = hashlib.sha256("agent-001".encode()).hexdigest()
        assert hash_agent_id("agent-001") == expected

    def test_deterministic(self):
        from ethos.identity.hashing import hash_agent_id
        h1 = hash_agent_id("agent-001")
        h2 = hash_agent_id("agent-001")
        assert h1 == h2

    def test_different_inputs_different_hashes(self):
        from ethos.identity.hashing import hash_agent_id
        h1 = hash_agent_id("agent-001")
        h2 = hash_agent_id("agent-002")
        assert h1 != h2

    def test_empty_string_is_valid(self):
        from ethos.identity.hashing import hash_agent_id
        result = hash_agent_id("")
        expected = hashlib.sha256(b"").hexdigest()
        assert result == expected

    def test_none_raises_type_error(self):
        from ethos.identity.hashing import hash_agent_id
        with pytest.raises(TypeError):
            hash_agent_id(None)


class TestReExports:
    """ethos/identity/__init__.py re-exports hash_agent_id."""

    def test_import_from_package(self):
        from ethos.identity import hash_agent_id
        assert callable(hash_agent_id)
        assert len(hash_agent_id("test")) == 64
