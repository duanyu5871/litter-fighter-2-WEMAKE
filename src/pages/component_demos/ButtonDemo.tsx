import { Button } from "../../Component/Buttons/Button";
import { StatusButton } from "../../Component/Buttons/StatusButton";
import { ToggleButton } from "../../Component/Buttons/ToggleButton";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";


export default function ButtonDemo() {
  return (
    <Frame label='Button'>
      <Space>
        <Button>
          按钮
        </Button>
        <ToggleButton>
          <>切换1</>
          <>切换2</>
        </ToggleButton>
        <StatusButton items={['状态1', '状态2', '状态3']} defaultValue="状态1" />
      </Space>
    </Frame>
  );
}
