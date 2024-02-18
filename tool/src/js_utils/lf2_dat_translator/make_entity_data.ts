export function make_entity_data(info: IGameObjInfo, frames: Record<TFrameId, IFrameInfo>): IEntityData {
  return {
    id: '',
    type: 'entity',
    base: info,
    frames: frames
  };
}
