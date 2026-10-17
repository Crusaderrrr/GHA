package com.gha.importer;

import java.time.Instant;

import org.springframework.stereotype.Service;

@Service
public class ImportService {

	private final GhArchiveClient archive;

	public ImportService(GhArchiveClient archive) {
		this.archive = archive;
	}

	/** Imports one hour. Must be idempotent and resumable (see import_hour). */
	public void importHour(Instant hour) {
		// TODO stage 2: archive.open(hour) -> GZIPInputStream -> lines -> Jackson -> filter -> insert
		throw new UnsupportedOperationException("not implemented");
	}
}
