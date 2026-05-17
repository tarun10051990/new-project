package com.jiomart.bulk.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class JioMartApiService {

    private static final String JIOMART_API_BASE = "https://api.jiomart.com/service/application/cart/v1.0";
    private final RestTemplate restTemplate;

    public JioMartApiService() {
        this.restTemplate = new RestTemplate();
    }

    private HttpHeaders buildHeaders(String accessToken, String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Cookie", "cra_access_token=" + accessToken + "; cra_refresh_token=" + refreshToken);
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        headers.set("Accept", "application/json");
        headers.set("Origin", "https://www.jiomart.com");
        headers.set("Referer", "https://www.jiomart.com/");
        return headers;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchAddresses(String accessToken, String refreshToken) {
        try {
            HttpHeaders headers = buildHeaders(accessToken, refreshToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                JIOMART_API_BASE + "/address",
                HttpMethod.GET,
                entity,
                Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("address")) {
                return (List<Map<String, Object>>) body.get("address");
            }
            return Collections.emptyList();
        } catch (Exception e) {
            System.err.println("Failed to fetch addresses from JioMart API: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> addAddress(String accessToken, String refreshToken, Map<String, Object> addressPayload) {
        try {
            HttpHeaders headers = buildHeaders(accessToken, refreshToken);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(addressPayload, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                JIOMART_API_BASE + "/address",
                HttpMethod.POST,
                entity,
                Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            System.err.println("Failed to add address to JioMart API: " + e.getMessage());
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    public Map<String, Object> mapJioMartAddressToLocal(Map<String, Object> jcpAddr) {
        Map<String, Object> result = new LinkedHashMap<>();

        Map<String, Object> customJson = jcpAddr.containsKey("_custom_json")
            ? (Map<String, Object>) jcpAddr.get("_custom_json") : null;

        String house = "";
        if (customJson != null && customJson.get("flat_or_house_no") != null) {
            house = String.valueOf(customJson.get("flat_or_house_no"));
        } else if (jcpAddr.get("address2") != null) {
            house = String.valueOf(jcpAddr.get("address2"));
        }

        String road = "";
        if (customJson != null && customJson.get("address_line") != null) {
            road = String.valueOf(customJson.get("address_line"));
        } else if (jcpAddr.get("address1") != null) {
            road = String.valueOf(jcpAddr.get("address1"));
        } else if (jcpAddr.get("area") != null) {
            road = String.valueOf(jcpAddr.get("area"));
        }

        String area = "";
        if (jcpAddr.get("landmark") != null) {
            area = String.valueOf(jcpAddr.get("landmark"));
        } else if (jcpAddr.get("area") != null) {
            area = String.valueOf(jcpAddr.get("area"));
        }

        result.put("fullName", jcpAddr.getOrDefault("name",
            jcpAddr.getOrDefault("contact_person", "Unknown")));
        result.put("mobileNo", jcpAddr.getOrDefault("phone", ""));
        result.put("pincode", jcpAddr.getOrDefault("area_code",
            jcpAddr.getOrDefault("pincode", "")));
        result.put("flatHouseNo", house);
        result.put("roadStreetName", road);
        result.put("localityLandmark", area);
        result.put("city", jcpAddr.getOrDefault("city", ""));
        result.put("state", jcpAddr.getOrDefault("state", ""));

        if (jcpAddr.containsKey("geo_location") && jcpAddr.get("geo_location") != null) {
            Map<String, Object> geo = (Map<String, Object>) jcpAddr.get("geo_location");
            result.put("latitude", geo.get("latitude") != null ? Double.parseDouble(String.valueOf(geo.get("latitude"))) : 0.0);
            result.put("longitude", geo.get("longitude") != null ? Double.parseDouble(String.valueOf(geo.get("longitude"))) : 0.0);
        } else {
            result.put("latitude", 0.0);
            result.put("longitude", 0.0);
        }

        return result;
    }

    public Map<String, Object> buildJioMartAddressPayload(String fullName, String mobileNo,
            String pincode, String flatHouseNo, String roadStreetName,
            String localityLandmark, String city, String state,
            Double latitude, Double longitude) {

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", fullName);
        payload.put("phone", mobileNo);
        payload.put("area_code", pincode);
        payload.put("address1", roadStreetName);
        payload.put("address2", flatHouseNo);
        payload.put("landmark", localityLandmark);
        payload.put("area", localityLandmark);
        payload.put("city", city);
        payload.put("state", state);
        payload.put("country", "India");
        payload.put("address_type", "home");

        Map<String, Object> customJson = new LinkedHashMap<>();
        customJson.put("flat_or_house_no", flatHouseNo);
        customJson.put("address_line", roadStreetName);
        payload.put("_custom_json", customJson);

        if (latitude != null && longitude != null && latitude != 0.0 && longitude != 0.0) {
            Map<String, Object> geo = new LinkedHashMap<>();
            geo.put("latitude", latitude);
            geo.put("longitude", longitude);
            payload.put("geo_location", geo);
        }

        return payload;
    }
}
