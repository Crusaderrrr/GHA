package com.gha.importer;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Instant;

import org.junit.jupiter.api.Test;

class GhArchiveClientTest {

	@Test
	void fileNameHasNoLeadingZeroHourAndIsUtc() {
		assertEquals("2026-01-05-7.json.gz", GhArchiveClient.fileName(Instant.parse("2026-01-05T07:00:00Z")));
		assertEquals("2026-01-05-15.json.gz", GhArchiveClient.fileName(Instant.parse("2026-01-05T15:00:00Z")));
	}
}
