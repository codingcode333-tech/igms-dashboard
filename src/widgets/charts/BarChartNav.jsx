export function BarChartNav({
    tabs,
    selectedTab,
    setTab
}) {
    return (
        <div className={"flex flex-wrap items-center justify-center w-full p-4"}>
            <div className="w-full block w-auto" id="navbar-default">
                <ul className="font-medium flex p-0 mt-4 rounded-lg space-x-4 md:mt-0">
                    {
                        tabs.map(tab =>
                            <li key={tab.name}>
                                {
                                    tab.name == selectedTab
                                        ? <a className="block rounded bg-transparent text-blue-900 p-0 select-none cursor-pointer font-bold border-b-4 border-blue-900" aria-current="page">&nbsp;{tab.text}&nbsp;</a>
                                        : <a className="block rounded hover:bg-transparent border-0 hover:text-blue-900 p-0 select-none cursor-pointer" onClick={() => setTab(tab.name)}>&nbsp;{tab.text}&nbsp;</a>
                                }
                            </li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}