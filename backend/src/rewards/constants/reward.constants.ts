import { RewardType } from '../enums/reward-type.enum';

export const RewardTable = {

  [RewardType.TRAVELER_VERIFY]:{
    verified:1000,
    unverified:null,
  },

  [RewardType.STAY]:{
    verified:2000,
    unverified:null,
  },

  [RewardType.PLACE_VERIFY]:{
    verified:500,
    unverified:100,
  },

  [RewardType.COURSE_COMPLETE]:{
    verified:1000,
    unverified:500,
  },

  [RewardType.CONGESTION]:{
    verified:300,
    unverified:300,
  },

  [RewardType.NIGHT_EVENT]:{
    verified:1000,
    unverified:300,
  }

};