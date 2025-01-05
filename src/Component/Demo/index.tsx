import { Outlet } from "react-router";
import { Button } from "../Buttons/Button";
import { StatusButton } from "../Buttons/StatusButton";
import { ToggleButton } from "../Buttons/ToggleButton";
import Combine from "../Combine";
import Frame from "../Frame";
import { Input } from "../Input";
import Select from "../Select";
import { Space } from "../Space";

export default function ComponentDemo() {
  return (
    <Space style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'stretch' }}>
      <Outlet />
      <Frame label='InputNumber' >
        <Space direction='column'>
          <Input type="number" step={1} />
          <Input type="number" step={1} prefix='prefix' />
          <Input type="number" step={1} placeholder="placeholder" />
          <Input type="number" step={1} suffix="suffix" />
          <Input type="number" step={1} prefix='prefix' placeholder="placeholder" />
          <Input type="number" step={1} placeholder="placeholder" suffix="suffix" />
          <Input type="number" step={1} prefix='prefix' placeholder="placeholder" suffix="suffix" />
        </Space>
      </Frame>
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
          <Select items={['option 0', 'option 1']} />
        </Space>
      </Frame>
      <Frame label='Input'>
        <Space direction='column'>
          <Input />
          <Input prefix='prefix' />
          <Input placeholder="placeholder" />
          <Input suffix="placeholder" />
          <Input prefix='prefix' placeholder="placeholder" />
          <Input placeholder="placeholder" suffix="suffix" />
          <Input prefix='prefix' placeholder="placeholder" suffix="suffix" />
        </Space>
      </Frame>
    </Space>
  )
}