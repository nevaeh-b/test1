import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { SaveCourseDto } from './dto/save-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  findAll(@Query('barrierFree') barrierFree?: string) {
    const parsed = barrierFree === undefined ? undefined : barrierFree === 'true';
    return this.coursesService.findAll(parsed);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  saveCourse(@Req() req: any, @Body() dto: SaveCourseDto) {
    return this.coursesService.saveCourse(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/scrap')
  scrap(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.coursesService.scrap(req.user.userId, id);
  }
}