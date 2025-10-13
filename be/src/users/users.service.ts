import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){}
  create(createUserDto: CreateUserDto) {
   const newUser= this.userRepository.create(createUserDto);
   return this.userRepository.save(newUser)
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({id});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOneBy({id});
  }

 async remove(id: number) {
    const user= await this.userRepository.findOneBy({id})
    if(user){
      await this.userRepository.delete({id});
      return {message:`User ${id} delete success`};
    }
    return {message: `User ${id} not found`};
  }
}
