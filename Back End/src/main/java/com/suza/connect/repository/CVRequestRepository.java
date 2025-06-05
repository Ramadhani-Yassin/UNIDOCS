package com.suza.connect.repository;

import com.suza.connect.model.CVRequest;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CVRequestRepository extends CrudRepository<CVRequest, UUID> {
    // Additional query methods can be defined here if needed
}