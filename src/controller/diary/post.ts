import { Request, Response, NextFunction } from "express";
import { diaryType, stateType } from "../../@types/entity";
import Plant from "../../entity/Plant";
import Diary from "../../entity/Diary";
import State from "../../entity/State";
import Parameter from "../../entity/Parameter";

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { plantId } = req.params;
    const {
      createdDate: createdAt,
      note,
      weatherId: weatherName,
      humidity,
      finedust,
      state,
    } = req.body;
    const multerS3: any = req.file;
    let image: string | undefined;
    if (multerS3) {
      image = multerS3.location;
    }

    const diaryData: diaryType = { createdAt, note, weatherName, humidity, finedust, image };

    //! body로 입력되지 않은 데이터의 key value쌍 삭제
    let diaryDataKeys: string[] = Object.keys(diaryData);
    diaryDataKeys.forEach((key: string) => {
      if (diaryData[key] === undefined) {
        delete diaryData[key];
      }
    });
    // console.log(diaryData);

    diaryDataKeys = Object.keys(diaryData);
    if (diaryDataKeys.length === 0 || (diaryDataKeys.length === 1 && diaryData.createdAt)) {
      res.status(400).json("Send at least one date");
      return;
    }

    let states: State[] = [];
    if (state?.length) {
      // console.log(state);
      states = await Promise.all(
        state.map(async (oneState: stateType) => {
          const findParam = await Parameter.findOne({ id: oneState.id });
          if (findParam === undefined) {
            return undefined;
          }

          const newState = await State.insertState(findParam, oneState.level);
          // console.log(newState);
          return newState;
        }),
      );
    }
    diaryData.states = states;

    // console.log(diaryData);
    const newDiary = await Diary.insertDiary(diaryData);
    if (newDiary === undefined) {
      res.status(400).json("Fail to insert diary");
      return;
    }

    const findPlant: Plant | undefined = await Plant.findOne({ id: Number(plantId) });
    if (findPlant === undefined) {
      res.status(400).json("You send bad request");
      return;
    }
    newDiary.plant = findPlant;
    // console.log(newDiary);

    await newDiary.save();

    delete newDiary.updatedAt;
    const plantKeys = Object.keys(newDiary.plant);
    plantKeys.forEach((key) => {
      if (key !== "id" && key !== "nickname") {
        delete newDiary.plant[key];
      }
    });
    newDiary.states.forEach((oneState) => {
      const updateState = oneState;
      updateState.id = oneState.parameter.id;
      delete updateState.parameter;
      delete updateState.createdAt;
      delete updateState.updatedAt;
    });

    res.json(newDiary);
    return;
  } catch (err) {
    console.error(err);
    res.status(400).json(`Error name: ${err.name}`);
  }
};
