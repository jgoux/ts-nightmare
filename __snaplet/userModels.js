import { copycat } from "@snaplet/copycat";
  import dataExamples from "./dataExamples.json" with { type: "json" };

  const getCustomExamples = (input) => dataExamples.find((e) => e.input === input)?.examples ?? [];
  const getExamples = (shape) => dataExamples.find((e) => e.shape === shape)?.examples ?? [];

  export const userModels = {
comment: {
  data: {
    id: ({ seed, options }) => { return copycat.uuid(seed) },
    content: ({ seed }) => copycat.oneOfString(seed, getExamples('POST_COMMENT')),
    author_id: ({ seed, options }) => { return copycat.uuid(seed) },
    post_id: ({ seed, options }) => { return copycat.uuid(seed) },
    written_at: ({ seed, options }) => { return copycat.dateString(seed, { ...{"minYear":2020}, ...options }) }
  }
},
post: {
  data: {
    id: ({ seed, options }) => { return copycat.uuid(seed) },
    title: ({ seed, options }) => { return copycat.sentence(seed, options) },
    content: ({ seed, options }) => { return copycat.paragraph(seed, options) },
    author_id: ({ seed, options }) => { return copycat.uuid(seed) }
  }
},
user: {
  data: {
    id: ({ seed, options }) => { return copycat.uuid(seed) },
    username: ({ seed, options }) => { return copycat.username(seed, options) },
    email: ({ seed, options }) => { return copycat.email(seed, options) }
  }
}
};