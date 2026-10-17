package com.gha.trends;

import java.time.Instant;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TrendsController {

	public record TrendingRepo(long repoId, String name, String language, Integer totalStars,
			int starsInWindow, int forksInWindow, double score) {
	}

	public record HistoryPoint(Instant hour, int stars, int forks, int events) {
	}

	/** window: 24h | 7d */
	@GetMapping("/trends")
	public List<TrendingRepo> trends(@RequestParam(defaultValue = "24h") String window,
			@RequestParam(required = false) Integer minStars,
			@RequestParam(required = false) Integer maxStars,
			@RequestParam(required = false) String language) {
		// TODO stage 4: query hourly aggregates and rank by the growth formula
		return List.of();
	}

	@GetMapping("/repos/{owner}/{name}/history")
	public List<HistoryPoint> history(@PathVariable String owner, @PathVariable String name) {
		// TODO stage 4
		return List.of();
	}
}
