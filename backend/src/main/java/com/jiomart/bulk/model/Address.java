package com.jiomart.bulk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String fullName;
    private String mobileNo;
    private String pincode;
    private String flatHouseNo;
    private String roadStreetName;
    private String localityLandmark;
    private String city;
    private String state;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Address() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getMobileNo() { return mobileNo; }
    public void setMobileNo(String mobileNo) { this.mobileNo = mobileNo; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getFlatHouseNo() { return flatHouseNo; }
    public void setFlatHouseNo(String flatHouseNo) { this.flatHouseNo = flatHouseNo; }
    public String getRoadStreetName() { return roadStreetName; }
    public void setRoadStreetName(String roadStreetName) { this.roadStreetName = roadStreetName; }
    public String getLocalityLandmark() { return localityLandmark; }
    public void setLocalityLandmark(String localityLandmark) { this.localityLandmark = localityLandmark; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
