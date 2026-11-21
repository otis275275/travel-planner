package com.travelplanning.backend.mappers;

import com.travelplanning.backend.dtos.trip.TripResponse;
import com.travelplanning.backend.entities.Trip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {DestinationMapper.class})
public interface TripMapper {

    @Mapping(target = "role", constant = "OWNER")
    TripResponse toDto(Trip trip);

    List<TripResponse> toDtoList(List<Trip> trips);
}
