import { Button } from "../Button";
import { Space } from "../Space";
import { ToggleButton } from "../ToggleButton";

export default function ComponentDemo() {
  return (
    <Space>
      {true}
      <Button>
        Button
      </Button>
      <Button>
        按钮
      </Button>
      <ToggleButton>
        <>ToggleButton1</>
        <>ToggleButton2</>
      </ToggleButton>
      <ToggleButton>
        <>切换按钮1</>
        <>切换按钮2</>
      </ToggleButton>
    </Space>
  )
}