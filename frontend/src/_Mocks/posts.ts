import { faker } from '@faker-js/faker/locale/zh_CN';
import type { Post } from '@/types/index.ts';

// 创建一个生成单个随机帖子的函数
export function createRandomPost(): Post {
  // 随机生成 0 到 3 个媒体文件
  const mediaCount = faker.number.int({ min: 0, max: 3 });
  const media = Array.from({ length: mediaCount }, () => ({
    type: faker.helpers.arrayElement(['image', 'video', 'gif'] as const),
    url: faker.image.urlPicsumPhotos({
      width: faker.number.int({ min: 400, max: 800 }),
      height: faker.number.int({ min: 300, max: 600 }) 
    }),
  }));

  return {
    // 既然你提到了 mongodb, 用 mongodbObjectId 生成器会非常贴切
    _id: faker.database.mongodbObjectId(), 
    content: faker.lorem.paragraph(2), // 生成两段的随机文本
    media, // 上面生成的媒体数组
    createdAt: faker.date.past().toISOString(), // 生成一个过去的随机时间,并转为ISO字符串

    authorInfo: {
      // 使用 person 模块生成更真实的名字
      displayName: faker.person.fullName(), 
      username: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
      isVerified: faker.datatype.boolean(0.3), // 30% 的概率为 true
    },

    stats: {
      repliesCount: faker.number.int({ min: 0, max: 1500 }),
      quotesCount: faker.number.int({ min: 0, max: 500 }),
      likesCount: faker.number.int({ min: 0, max: 20000 }),
      viewsCount: faker.number.int({ min: 1000, max: 500000 }),
    },

    currentUserInteraction: {
      isLiked: faker.datatype.boolean(),
      isBookmarked: faker.datatype.boolean(),
      isRetweeted: faker.datatype.boolean(),
    },
  };
}

// 生成一个包含 15 个随机帖子的列表
export const postList: Post[] = Array.from({ length: 15 }, createRandomPost);