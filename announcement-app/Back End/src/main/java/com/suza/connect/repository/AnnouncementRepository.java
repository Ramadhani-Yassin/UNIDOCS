package com.suza.connect.repository;

import com.suza.connect.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // Additional query methods can be defined here if needed
}