import { BlankLayout } from '@/layouts';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, Heading, majorScale, Pane, Paragraph } from 'evergreen-ui';

function ScanPage() {
  return (
    <BlankLayout>
      <Card
        elevation={2}
        textAlign="center"
        background="tint1"
        position="relative"
        width="40%"
        minWidth="max-content"
        padding={majorScale(5)}
      >
        <Heading
          is="h1"
          size={900}
        >
          Scan QR
        </Heading>
        <Paragraph marginY={majorScale(3)}>Scan QR code to continue</Paragraph>
        <Pane
          width="80%"
          marginBottom="40%"
          marginX="auto"
        >
          <Scanner
            onScan={(qrCode) => {
              console.log(qrCode);
            }}
          />
        </Pane>
      </Card>
    </BlankLayout>
  );
}

export default ScanPage;
