import { Button } from "../Buttons/Button";
import Combine from "../Combine";
import Frame from "../Frame";
import { Space } from "../Space";
import { StatusButton } from "../Buttons/StatusButton";
import { ToggleButton } from "../Buttons/ToggleButton";
import Select from "../Select";

export default function ComponentDemo() {
  return (
    <Space>
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

      <Frame label='Combine'>
        <Space>
          <Combine direction='column'>
            <Button>
              T
            </Button>
            <Button>
              T
            </Button>
            <Button>
              T
            </Button>
          </Combine>

          <Combine direction='column'>
            <Button>
              T
            </Button>
            <Combine direction='row'>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
            </Combine>
            <Button>
              T
            </Button>
          </Combine>
          <Combine direction='column'>
            <Button>
              T
            </Button>
            <Button>
              T
            </Button>
            <Combine direction='row'>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
            </Combine>
          </Combine>
          <Combine direction='column'>
            <Combine direction='row'>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
            </Combine>
            <Button>
              T
            </Button>
            <Button>
              T
            </Button>
          </Combine>

          <Combine direction='row'>
            <Button>
              T
            </Button>
            <Button>
              T
            </Button>
            <Button>
              T
            </Button>
          </Combine>
          <Combine direction='row'>
            <Button>
              T
            </Button>
            <Combine direction='column'>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
            </Combine>
            <Button>
              T
            </Button>
          </Combine>
          <Combine direction='row'>
            <Button>
              T
            </Button>
            <Combine direction='column'>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
            </Combine>

            <Button>
              T
            </Button>
          </Combine>
          <Combine direction='row'>
            <Combine direction='column'>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
              <Button>
                T
              </Button>
            </Combine>
            <Button>
              T
            </Button>
            <Button>
              T
            </Button>
          </Combine>
        </Space>
      </Frame>

      <Frame label='Select'>
        <Space>
          <Select items={['option 0', 'option 1']}/>
        </Space>
      </Frame>
    </Space>

  )
}