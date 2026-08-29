import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PlacesService } from './places.service';
import { FindPlacesDto } from './dto/find-places.dto';

@Controller('places')
export class PlacesController {
  constructor(private placesService: PlacesService) {}

  @Get()
  findAll(@Query() query: FindPlacesDto) {
    return this.placesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.findOne(id);
  }
}