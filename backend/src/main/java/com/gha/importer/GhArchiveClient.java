package com.gha.importer;

import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GhArchiveClient {

	// Hour has no leading zero: 2026-01-05-7.json.gz
	private static final DateTimeFormatter FILE_NAME =
			DateTimeFormatter.ofPattern("yyyy-MM-dd-H'.json.gz'").withZone(ZoneOffset.UTC);

	private final RestClient http;

	public GhArchiveClient(RestClient.Builder builder, @Value("${gha.archive.base-url}") String baseUrl) {
		this.http = builder.baseUrl(baseUrl).build();
	}

	static String fileName(Instant hour) {
		return FILE_NAME.format(hour);
	}

	/**
	 * Opens the raw gzipped body of one hour. Empty means "not published yet" (404).
	 * The caller must close the stream.
	 */
	public Optional<InputStream> open(Instant hour) {
		// TODO stage 2: GET fileName(hour), return empty on 404, stream the body without buffering it
		throw new UnsupportedOperationException("not implemented");
	}
}
