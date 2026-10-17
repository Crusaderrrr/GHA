package com.gha.importer;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/import")
public class ImportController {

	private final ImportService importService;

	public ImportController(ImportService importService) {
		this.importService = importService;
	}

	/** Backfill: POST /api/import?from=2026-01-01T00:00:00Z&to=2026-01-02T00:00:00Z (to is exclusive). */
	@PostMapping
	public ResponseEntity<Void> importRange(@RequestParam Instant from, @RequestParam Instant to) {
		for (Instant h = from.truncatedTo(ChronoUnit.HOURS); h.isBefore(to); h = h.plus(1, ChronoUnit.HOURS)) {
			importService.importHour(h);
		}
		return ResponseEntity.accepted().build();
	}
}
