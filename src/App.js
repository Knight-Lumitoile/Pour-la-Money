import "./App.css"
import Forms from "./Components/Forms/Forms"
import Icons from "./Components/Icons/Icons"
import locale from "./Static/Config/Locale/content.json"
import Pages from "./Components/Pages/Pages"
import req from "./Connector/WebConnector"
import { App as Antd, Button, ConfigProvider, Layout, Space, Tooltip, Typography } from "antd"
import { createContext, useEffect, useState } from "react"
import { colorPrimary } from "./Static/Config/Color/Color";

const { ipcRenderer } = window.require("electron")

export const AppConfig = createContext(undefined)

function App() {

    const [arrRecords, _arrRecords] = useState([])
    const [arrTypes, _arrTypes] = useState([])
    const [arrCurrencies, _arrCurrencies] = useState([])
    const [config, _config] = useState({
        locale: "en", colorPrimary: colorPrimary
    })

    const [isAppReady, _isAppReady] = useState(false)
    const [isSiderOpen, _isSiderOpen] = useState(false)
    const [isCurrencyFormOpen, _isCurrencyFormOpen] = useState(false)
    const [isTypeFormOpen, _isTypeFormOpen] = useState(false)
    const [isSettingsFormOpen, _isSettingsFormOpen] = useState(false)

    const init = () => {
        const objAction = setInterval(async () => {
            const strServerAddress = await ipcRenderer.invoke("server-address")
            if (strServerAddress) {
                global.serverAddress = strServerAddress
                const objRequest = await fetch(`${global.serverAddress}ready`)
                if (objRequest?.status === 200) {
                    clearInterval(objAction)
                    _isAppReady(true)
                }
            }
        }, 200)
    }

    const refreshData = (callback = () => undefined) => {
        req.getConfig().then(data => (!data || Object.keys(data).length === 0) ? req.upsertConfig(config) : _config(data))
        req.getCurrency().then(_arrCurrencies)
        req.getTransactionType().then(_arrTypes)
        req.getTransactionRecord().then(data => {
            _arrRecords(data)
            callback(data)
        })
    }

    useEffect(() => {
        init()
        global.refreshData = refreshData
        global.openModalManageCurrency = () => _isCurrencyFormOpen(true)
        global.openModalManageTypes = () => _isTypeFormOpen(true)
    }, [])

    useEffect(() => {
        if (isAppReady) refreshData()
    }, [isAppReady])

    return (
        isAppReady ?
            <AppConfig.Provider value={{ arrRecords, _arrRecords, arrTypes, _arrTypes, arrCurrencies, _arrCurrencies, config, _config }}>
                <ConfigProvider theme={{
                    components: {
                        Layout: {
                            headerBg: "#fff", bodyBg: "#fff", footerBg: "#fff",
                        }, Button: {
                            colorText: "#666666"
                        }, Tooltip: {
                            fontSize: 12
                        }, Message: {
                            colorError: "red"
                        }
                    }, token: {
                        fontFamily: `Neutralizer, StarRailEn, StarRailCn, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`, fontWeightStrong: 400, colorPrimary: config.colorPrimary, colorError: config.colorPrimary, colorLink: config.colorPrimary
                    }
                }}>
                    <Antd>
                        <Layout className={"App"}>
                            <Layout.Header className={"Header"}>
                                <Space className={`LogoTitle`} onClick={() => _isSiderOpen(pre => !pre)} size={0}>
                                    <img className={"TitleImage"} src={"./logo512.png"} alt={""} width={60} height={60} />
                                    <Typography className={"TitleText"}>{"Pour la Money"}</Typography>
                                </Space>
                                <Space size={0}>
                                    <Tooltip title={locale[config.locale].tooltip.manage_currency}>
                                        <Button onClick={() => _isCurrencyFormOpen(prevState => !prevState)} icon={<Icons.UI.Currency />} size={"large"} type={"text"} />
                                    </Tooltip>
                                    <Tooltip title={locale[config.locale].tooltip.manage_type}>
                                        <Button onClick={() => _isTypeFormOpen(prevState => !prevState)} icon={<Icons.UI.PriceTag />} size={"large"} type={"text"} />
                                    </Tooltip>
                                    <Tooltip title={locale[config.locale].tooltip.refresh_data}>
                                        <Button onClick={global.refreshView} icon={<Icons.UI.Refresh />} size={"large"} type={"text"} />
                                    </Tooltip>
                                    <Tooltip title={locale[config.locale].tooltip.settings}>
                                        <Button onClick={() => _isSettingsFormOpen(prevState => !prevState)} icon={<Icons.UI.Settings />} size={"large"} type={"text"} />
                                    </Tooltip>
                                </Space>
                            </Layout.Header>
                            <Layout.Content>
                                <Pages.Transactions isSiderOpen={isSiderOpen} />
                            </Layout.Content>
                            <Forms.ManageCurrency open={isCurrencyFormOpen} onClose={() => _isCurrencyFormOpen(false)} />
                            <Forms.ManageTransactionType open={isTypeFormOpen} onClose={() => _isTypeFormOpen(false)} />
                            <Forms.Settings open={isSettingsFormOpen} onClose={() => _isSettingsFormOpen(false)} />
                        </Layout>
                    </Antd>
                </ConfigProvider>
            </AppConfig.Provider>
            :
            <>
                <p>Press Ctrl + R to refresh application if not responding.</p>
            </>
    )
}

export default App
