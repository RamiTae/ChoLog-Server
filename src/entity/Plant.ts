import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import User from "./User";
import Family from "./Family";
import Diary from "./Diary";
import Parameter from "./Parameter";

@Entity()
export default class Plant extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ nullable: true })
  mainImage!: string;

  @Column()
  nickname!: string;

  @Column()
  plantName!: string;

  @Column({ nullable: true })
  scientificName!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  adoptionDate!: Date;

  @Column({ type: "timestamp", nullable: true })
  deathDate!: Date;

  @Column({ type: "text", nullable: true })
  memo!: string;

  @Column({ type: "text", nullable: true })
  advice!: string;

  @Column({ type: "tinyint", default: 1 })
  openAllow!: number; // 0: 비공개, 1: 친구공개, 2: 전체공개

  @CreateDateColumn({ type: "timestamp" })
  public createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  public updatedAt!: Date;

  @ManyToOne(
    (type) => User,
    (user) => user.plants,
  )
  user!: User;

  @ManyToOne(
    (type) => Family,
    (family) => family.plants,
  )
  family!: Family;

  @OneToMany(
    (type) => Diary,
    (diary) => diary.plant,
  )
  diaries!: Diary[];

  @ManyToMany((type) => Parameter)
  @JoinTable({ name: "plant_parameter" })
  parameters!: Parameter[];

  //* plant id로 Plant찾기
  static findById(id: number): Promise<Plant | undefined> {
    return this.createQueryBuilder("plant")
      .where("plant.id = :id", { id })
      .getOne();
  }

  //* plant id로 diaries찾기
  static async findDiariesById(id: number): Promise<Diary[] | undefined> {
    const plant = await this.findById(id);

    if (plant === undefined) {
      return undefined;
    }
    return plant.diaries;
  }
}