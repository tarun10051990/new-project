package com.jiomart.bulk.service;

import com.jiomart.bulk.model.Address;
import com.jiomart.bulk.repository.AddressRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AddressService {
    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<Address> getByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address save(Address address) {
        return addressRepository.save(address);
    }

    public Optional<Address> findById(Long id) {
        return addressRepository.findById(id);
    }

    public void delete(Long id) {
        addressRepository.deleteById(id);
    }
}
