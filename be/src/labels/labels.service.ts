import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Repository } from 'typeorm';
import { Label } from './entities/label.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private labelRepo: Repository<Label>,
  ) {}

  create(createLabelDto: CreateLabelDto) {
    const label = this.labelRepo.create(createLabelDto);
    return this.labelRepo.save(label);
  }

  findAll() {
    return this.labelRepo.find();
  }

  async findOne(id: string) {
    return this.labelRepo.findOne({ where: { id } });
  }

  async update(id: string, updateLabelDto: UpdateLabelDto) {
    const label = await this.labelRepo.findOne({ where: { id } });
    if (!label) throw new NotFoundException('Label not found');
    Object.assign(label, updateLabelDto);
    return this.labelRepo.save(label);
  }

  async remove(id: string) {
    const label = await this.labelRepo.findOne({ where: { id } });
    if (!label) throw new NotFoundException('Label not found');
    await this.labelRepo.remove(label);
    return { message: 'Label removed successfully' };
  }
}
