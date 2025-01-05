import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";

export default function CombineDemo() {
  return (
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
  );
}
