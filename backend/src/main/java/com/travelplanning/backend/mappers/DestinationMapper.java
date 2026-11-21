package com.travelplanning.backend.mappers;

import com.travelplanning.backend.dtos.destination.DestinationDto;
import com.travelplanning.backend.entities.Destination;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DestinationMapper {

    DestinationDto toDto(Destination destination);

    List<DestinationDto> toDtoList(List<Destination> destinations);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Destination toEntity(DestinationDto dto);
}
