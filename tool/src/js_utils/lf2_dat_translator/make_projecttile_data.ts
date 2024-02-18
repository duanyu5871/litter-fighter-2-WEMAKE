export function make_projecttile_data(info: IProjecttileInfo, frames: Record<TFrameId, IFrameInfo>): IProjecttileData {
  return {
    id: '',
    type: 'projecttile',
    base: info,
    frames: frames
  };
}
