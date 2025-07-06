import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
} from '@mui/material';
import {
  AcUnit as CoolIcon,
  Whatshot as WarmIcon,
  Opacity as DryIcon,
  Sync as AutoIcon,
  Air as BlowIcon,
  Devices as DevicesIcon,
  Lightbulb as LightIcon,
} from '@mui/icons-material';
import {
  fetchAppliances,
  fetchDevices,
  sendSignal,
  setAirconSettings,
} from './api';

// Rechartsのインポート
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const getModeColor = (mode: string) => {
  switch (mode) {
    case 'cool':
      return '#00bcd4';
    case 'warm':
      return '#f44336';
    case 'dry':
      return '#4caf50';
    case 'blow':
      return '#9e9e9e';
    case 'auto':
      return '#ff9800';
    default:
      return '#000000';
  }
};

const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'cool':
      return <CoolIcon fontSize="large" />;
    case 'warm':
      return <WarmIcon fontSize="large" />;
    case 'dry':
      return <DryIcon fontSize="large" />;
    case 'blow':
      return <BlowIcon fontSize="large" />;
    case 'auto':
      return <AutoIcon fontSize="large" />;
    default:
      return <DevicesIcon fontSize="large" />;
  }
};

function AirconControl({
  app,
  onUpdate,
}: {
  app: any;
  onUpdate: () => void;
}) {
  const [mode, setMode] = useState(app.settings.mode);
  const [temp, setTemp] = useState(Number(app.settings.temp));
  const [vol, setVol] = useState(app.settings.vol);
  const [dir, setDir] = useState(app.settings.dir);

  const modes = Object.keys(app.aircon.range.modes);
  const modeRange = app.aircon.range.modes[mode];
  const tempRange = modeRange?.temp?.map(Number) || [];
  const volRange = modeRange?.vol || [];
  const dirRange = modeRange?.dir || [];

  const sendSettings = async (newSettings: any) => {
    try {
      await setAirconSettings(app.id, {
        temp: newSettings.temp?.toString() ?? app.settings.temp,
        mode: newSettings.mode ?? app.settings.mode,
        vol: newSettings.vol ?? app.settings.vol,
        dir: newSettings.dir ?? app.settings.dir,
        button: newSettings.button ?? '',
      });
      onUpdate();
    } catch {
      alert('エアコン設定送信に失敗しました');
    }
  };

  const handleModeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const newMode = e.target.value as string;
    setMode(newMode);
    const newTemp = app.aircon.range.modes[newMode].temp?.[0] || temp;
    const newVol = app.aircon.range.modes[newMode].vol?.[0] || vol;
    const newDir = app.aircon.range.modes[newMode].dir?.[0] || dir;
    setTemp(Number(newTemp));
    setVol(newVol);
    setDir(newDir);

    sendSettings({ mode: newMode, temp: newTemp, vol: newVol, dir: newDir });
  };

  const handleTempChangeCommitted = (e: any, val: number | number[]) => {
    if (typeof val === 'number') {
      setTemp(val);
      sendSettings({ temp: val });
    }
  };

  const handleVolChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const v = e.target.value as string;
    setVol(v);
    sendSettings({ vol: v });
  };

  const handleDirChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const d = e.target.value as string;
    setDir(d);
    sendSettings({ dir: d });
  };

  return (
    <Box mt={2}>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>モード</InputLabel>
        <Select value={mode} label="モード" onChange={handleModeChange}>
          {modes.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {tempRange.length > 0 && (
        <>
          <Typography mt={2}>温度設定</Typography>
          <Slider
            value={temp}
            min={Math.min(...tempRange)}
            max={Math.max(...tempRange)}
            step={1}
            marks={tempRange.map((v) => ({ value: v, label: `${v}°` }))}
            onChangeCommitted={handleTempChangeCommitted}
          />
        </>
      )}

      {volRange.length > 0 && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>風量</InputLabel>
          <Select value={vol} label="風量" onChange={handleVolChange}>
            {volRange.map((v) => (
              <MenuItem key={v} value={v}>
                {v || '-'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {dirRange.length > 0 && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>風向き</InputLabel>
          <Select value={dir} label="風向き" onChange={handleDirChange}>
            {dirRange.map((v) => (
              <MenuItem key={v} value={v}>
                {v || '-'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {app.aircon.range.fixedButtons?.map((btn: string) => (
        <Button
          key={btn}
          variant="outlined"
          sx={{ mt: 1, mr: 1 }}
          onClick={() => sendSettings({ button: btn })}
        >
          {btn}
        </Button>
      ))}
    </Box>
  );
}

function TemperatureGraph({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Line type="monotone" dataKey="temp" stroke="#ff7300" name="気温(°C)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function HumidityGraph({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Line type="monotone" dataKey="humidity" stroke="#387908" name="湿度(%)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function LightGraph({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip formatter={(value: any) => [`${value} lx`, '明るさ']} />
        <Line type="monotone" dataKey="light" stroke="#8884d8" name="明るさ (lx)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function EnvironmentGraph({
  data,
}: {
  data: { time: string; temp: number; humidity: number; light: number }[];
}) {
  const scaledData = data.map((entry) => ({
    ...entry,
    light: entry.light / 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={scaledData}>
        <XAxis dataKey="time" />
        <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} />
        <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temp"
          stroke="#ff7300"
          name="気温(°C)"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="humidity"
          stroke="#387908"
          name="湿度(%)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="light"
          stroke="#8884d8"
          name="明るさ(lx ÷ 5)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function App() {
  const [appliances, setAppliances] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [pollingInterval, setPollingInterval] = useState(300000);
  const [tempPollingValue, setTempPollingValue] = useState(pollingInterval / 1000);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // 過去10回分の環境情報履歴
  const [pastEnvData, setPastEnvData] = useState<
    { time: string; temp: number; humidity: number; light: number }[]
  >([]);

  const showMessage = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarOpen(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [apps, devs] = await Promise.all([fetchAppliances(), fetchDevices()]);
      setAppliances(apps);
      setDevices(devs);

      if (devs.length > 0) {
        const newest = devs[0]?.newest_events ?? {};
        const te = newest?.te?.val ?? null;
        const hu = newest?.hu?.val ?? null;
        const il = newest?.il?.val ?? null;

        if (te !== null && hu !== null && il !== null) {
          const now = new Date();
          const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          const newEntry = { time: timeLabel, temp: te, humidity: hu, light: il };

          setPastEnvData((prev) => {
            const newData = [...prev, newEntry];
            if (newData.length > 10) {
              newData.shift();
            }
            return newData;
          });
        }
      }
    } catch (e) {
      showMessage('API取得失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    intervalIdRef.current = setInterval(load, pollingInterval);
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [pollingInterval]);

  const sendLightSignal = async (signalId: string) => {
    try {
      await sendSignal(signalId);
      showMessage('照明操作信号を送信しました');
      // await load();
    } catch {
      showMessage('照明操作に失敗しました');
    }
  };

  const applyPollingChange = () => {
    if (isNaN(tempPollingValue) || tempPollingValue <= 0) return;

    if (tempPollingValue < 30) {
      const ok = window.confirm(
        '30秒未満にするとサーバー負荷が高くなる可能性があります。\nそれでも設定を続けますか？'
      );
      if (!ok) return;
    }

    setPollingInterval(tempPollingValue * 1000);
    showMessage(`ポーリング間隔を ${tempPollingValue} 秒に変更しました`);
  };

  const renderEnvironmentCard = () => {
    if (devices.length === 0) return null;

    const newest = devices[0]?.newest_events ?? {};
    const te = newest?.te?.val ?? '-';
    const hu = newest?.hu?.val ?? '-';
    const il = newest?.il?.val ?? '-';

    return (
      <Card
        elevation={6}
        sx={{ bgcolor: '#fffde7', borderRadius: 2, border: '1px solid #ddd', mb: 3 }}
      >
        <CardHeader title="現在の環境情報" />
        <CardContent>
          <Typography variant="h6">気温: {te} °C</Typography>
          <Typography variant="h6">湿度: {hu} %</Typography>
          <Typography variant="h6">明るさ: {il} lx</Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box p={2} sx={{ bgcolor: '#e0e0e0', minHeight: '100vh' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <TextField
          type="number"
          label="ポーリング間隔（秒）"
          value={tempPollingValue}
          onChange={(e) => setTempPollingValue(Number(e.target.value))}
          inputProps={{ min: 5, step: 5 }}
          size="small"
          sx={{ width: 150 }}
        />
        <Button variant="contained" onClick={applyPollingChange}>
          変更を反映
        </Button>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          {renderEnvironmentCard()}
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            elevation={6}
            sx={{ bgcolor: '#fffde7', borderRadius: 2, border: '1px solid #ddd' }}
          >
            <CardHeader title="過去10回分の環境推移" />
            <CardContent>
              {/* <EnvironmentGraph data={pastEnvData} /> */}
                  <Typography variant="subtitle1">気温</Typography>
                  <TemperatureGraph data={pastEnvData} />
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>湿度</Typography>
                  <HumidityGraph data={pastEnvData} />
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>明るさ</Typography>
                  <LightGraph data={pastEnvData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {appliances.map((app) => (
          <Grid item xs={12} key={app.id}>
            <Card
              elevation={6}
              sx={{ bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #ddd' }}
            >
              <CardHeader
                avatar={getModeIcon(app.settings?.mode)}
                title={
                  <Typography variant="h5" sx={{ color: getModeColor(app.settings?.mode) }}>
                    {app.nickname}
                  </Typography>
                }
                subheader={
                  app.type === 'AC' ? (
                    <Typography variant="h6">
                      {app.settings.temp}
                      °{app.settings.temp_unit} / {app.settings.vol || '-'} /{' '}
                      {app.settings.dir || '-'}
                    </Typography>
                  ) : (
                    `状態: ${app.light?.state?.power || '-'} / 明るさ: ${
                      app.light?.state?.brightness ?? '-'
                    }`
                  )
                }
              />
              <CardContent sx={{ p: 3 }}>
                {app.type === 'AC' && <AirconControl app={app} onUpdate={load} />}
                {app.type === 'LIGHT' && (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {app.signals.map((signal: any) => (
                      <Button
                        key={signal.id}
                        variant="contained"
                        color="warning"
                        startIcon={<LightIcon />}
                        onClick={() => sendLightSignal(signal.id)}
                      >
                        {signal.name}
                      </Button>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
