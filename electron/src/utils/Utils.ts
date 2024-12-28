export const randomStr = (num: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let ret = "";
  const charactersLength = characters.length;
  for (let i = 0; i < num; i++)
    ret += characters.at(Math.floor(Math.random() * charactersLength));
  return ret;
};
