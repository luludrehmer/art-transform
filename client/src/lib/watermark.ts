/**
 * Art & See logo watermark - uses the footer logo SVG as a tiled pattern.
 * Applied only over the image area (graphics region).
 * SVG embedded as data URL to avoid CORS/load failures.
 */

const LOGO_SVG_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjM2IiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgMjM2IDg4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTY1LjM0OCAxNi45MDA0QzE2NS4zNDggMjguMjcyNyAxNTcuODk4IDM2LjQ3OTEgMTQyLjk5OCA0MS41MTk2QzE0Ny4yNDkgNDMuNzI3NCAxNDkuNjQ4IDQ3Ljc0NzMgMTUwLjE5NiA1My41NzkyQzE1MC4zNjQgNTUuMzcwNCAxNTAuNDQ4IDU3LjY0MDcgMTUwLjQ0OCA2MC4zOTAxQzE1MC40NDggNjMuMTM5NCAxNDkuNjY5IDY2LjIwMTIgMTQ4LjExMiA2OS41NzU0QzE0Ni41NTUgNzIuOTA4IDE0NC4zMjQgNzUuODY1NiAxNDEuNDIgNzguNDQ4M0MxMzQuOTM4IDg0LjI4MDMgMTI2LjcxIDg3LjE5NjIgMTE2LjczNSA4Ny4xOTYyQzEwNi4wODYgODcuMTk2MiA5Ny40MTU3IDg0LjAwOTUgOTAuNzIzNiA3Ny42MzZDODQuMjQxOCA3MS40NzA4IDgxLjAwMSA2My43NjQzIDgxLjAwMSA1NC41MTY1QzgxLjAwMSA0Ny44OTMxIDgzLjEyNjUgNDEuODk0NSA4Ny4zNzc1IDM2LjUyMDdDOTEuNDYwMSAzMS4zOTcgOTYuNjM3MSAyNy44NzcgMTAyLjkwOCAyNS45NjA3QzEwMC4xMyAyMy4yMTE0IDk4Ljc0MTYgMjAuNDQxMiA5OC43NDE2IDE3LjY1MDJDOTguNzQxNiAxNC44NTkyIDk5LjIyNTYgMTIuNDQzMSAxMDAuMTk0IDEwLjQwMTlDMTAxLjIwNCA4LjMxOTA5IDEwMi42MTQgNi41NDg2OCAxMDQuNDI0IDUuMDkwNjlDMTA4LjIxMiAxLjk2NjQzIDExMy4yNDEgMC40MDQyOTcgMTE5LjUxMyAwLjQwNDI5N0MxMjYuODM2IDAuNDA0Mjk3IDEzMS44NDUgMS41MDgyIDEzNC41MzggMy43MTYwMUMxMzUuMjU0IDQuMjk5MjEgMTM1LjYxMiA0LjgxOTkyIDEzNS42MTIgNS4yNzgxNEMxMzUuNjEyIDUuNzM2MzcgMTM1LjU3IDYuNTA3MDIgMTM1LjQ4NSA3LjU5MDFDMTM1LjQwMSA4LjY3MzE3IDEzNS4yNTQgOS43OTc5MSAxMzUuMDQzIDEwLjk2NDNDMTM0LjU4IDEzLjgzODYgMTMzLjk0OSAxNS4yNzU4IDEzMy4xNDkgMTUuMjc1OEMxMzIuNjAyIDE1LjI3NTggMTMxLjk5MiAxNS4wODgzIDEzMS4zMTkgMTQuNzEzNEMxMzAuNjg3IDE0LjMzODUgMTMwLjMwOCAxMy43NzYxIDEzMC4xODIgMTMuMDI2M0MxMjkuMDQ2IDcuMDY5MzkgMTI1LjUxIDQuMDkwOTIgMTE5LjU3NiA0LjA5MDkyQzExNi4zMzUgNC4wOTA5MiAxMTMuNjQxIDUuMjU3MzEgMTExLjQ5NSA3LjU5MDFDMTA5LjQ3NCA5LjgzOTU2IDEwOC40NjQgMTIuMzM5IDEwOC40NjQgMTUuMDg4M0MxMDguNDY0IDIwLjU4NyAxMTAuOTI2IDI0LjM1NyAxMTUuODUxIDI2LjM5ODFDMTE3LjI4MiAyNi45ODEzIDExNy45OTcgMjcuNjg5NSAxMTcuOTk3IDI4LjUyMjZDMTE3Ljk5NyAyOS4zNTU4IDExNi42MjkgMzAuMDAxNSAxMTMuODk0IDMwLjQ1OTdDMTExLjIgMzAuOTE3OSAxMDguNTA2IDMxLjg1NTIgMTA1LjgxMyAzMy4yNzE1QzEwMy4xMTkgMzQuNjg3OCAxMDAuODI1IDM2LjQ1ODMgOTguOTMxIDM4LjU4MjhDOTUuMTQyOSA0Mi45NTY3IDkzLjI0ODkgNDguNTU5NiA5My4yNDg5IDU1LjM5MTNDOTMuMjQ4OSA2Mi41NTYyIDk1Ljc3NDMgNjguNjU5IDEwMC44MjUgNzMuNjk5NEMxMDUuOTYgNzguODY0OSAxMTIuNDIxIDgxLjQ0NzYgMTIwLjIwNyA4MS40NDc2QzEzMC4zNTEgODEuNDQ3NiAxMzcuMTA2IDc3LjM2NTIgMTQwLjQ3MyA2OS4yMDA1QzE0MS42NTEgNjYuNDA5NSAxNDIuMjQxIDYzLjU3NjggMTQyLjI0MSA2MC43MDI1QzE0Mi4yNDEgNTcuODI4MiAxNDEuOTY3IDU1LjUxNjIgMTQxLjQyIDUzLjc2NjdDMTQwLjkxNSA1Mi4wMTcxIDE0MC4xMzYgNTAuNDk2NiAxMzkuMDg0IDQ5LjIwNTJDMTM2LjcyNyA0Ni4zMzA5IDEzMy41MDcgNDQuODkzOCAxMjkuNDI1IDQ0Ljg5MzhDMTI1Ljc2MyA0NC44OTM4IDEyMi4zMTEgNDYuMjA2IDExOS4wNzEgNDguODMwM0MxMTUuOTE0IDUxLjMyOTcgMTEzLjk1NyA1NC4zMjkgMTEzLjE5OSA1Ny44MjgyQzExNS42NCA1OC41NzggMTE2Ljg2MSA2MC4wMTUyIDExNi44NjEgNjIuMTM5N0MxMTYuODYxIDYzLjQzMSAxMTYuNDYxIDY0LjQ1MTYgMTE1LjY2MSA2NS4yMDE1QzExNC45MDQgNjUuOTA5NiAxMTMuOTM2IDY2LjI2MzcgMTEyLjc1NyA2Ni4yNjM3QzExMS41NzkgNjYuMjYzNyAxMTAuNDg0IDY1LjY1OTcgMTA5LjQ3NCA2NC40NTE2QzEwOC40NjQgNjMuMjQzNiAxMDcuOTU5IDYxLjY2MDYgMTA3Ljk1OSA1OS43MDI4QzEwNy45NTkgNTcuNzQ0OSAxMDguMjMzIDU1Ljc2NjIgMTA4Ljc4IDUzLjc2NjdDMTA5LjM2OSA1MS43MjU1IDExMC40NjMgNDkuNzY3NiAxMTIuMDYzIDQ3Ljg5MzFDMTE1LjUxNCA0My43NjkgMTIxLjM0MyA0MC41NjE1IDEyOS41NTEgMzguMjcwM0MxNDUuODM5IDMzLjcyOTcgMTU1LjQzNiAyOC4xNjg2IDE1OC4zNCAyMS41ODY4QzE1OS4yMjQgMTkuNTg3MyAxNTkuNjY2IDE3Ljc5NiAxNTkuNjY2IDE2LjIxMzFDMTU5LjY2NiAxNC42MzAxIDE1OS40OTcgMTMuNDAxMiAxNTkuMTYxIDEyLjUyNjRDMTU4Ljg2NiAxMS42NTE2IDE1OC40NjYgMTAuOTIyNiAxNTcuOTYxIDEwLjMzOTRDMTU2Ljk5MyA5LjIxNDcxIDE1NS42NjcgOC42NTIzNCAxNTMuOTg0IDguNjUyMzRDMTUyLjM0MiA4LjY1MjM0IDE1MS4zOTUgOS41MjcxNCAxNTEuMTQzIDExLjI3NjdDMTUyLjkxIDExLjY1MTYgMTUzLjc5NCAxMi41MjY0IDE1My43OTQgMTMuOTAxMUMxNTMuNzk0IDE0Ljg1OTIgMTUzLjQ3OCAxNS41ODgyIDE1Mi44NDcgMTYuMDg4MUMxNTIuMjU4IDE2LjU0NjMgMTUxLjQxNiAxNi43NzU0IDE1MC4zMjIgMTYuNzc1NEMxNDkuMjI3IDE2Ljc3NTQgMTQ4LjMwMiAxNi4zMzggMTQ3LjU0NCAxNS40NjMyQzE0Ni44MjggMTQuNTg4NCAxNDYuNDcxIDEzLjY1MTIgMTQ2LjQ3MSAxMi42NTE0QzE0Ni40NzEgMTEuNjEgMTQ2LjYzOSAxMC42NTE5IDE0Ni45NzYgOS43NzcwOEMxNDcuMzU1IDguODYwNjMgMTQ3Ljg4MSA4LjA0ODMyIDE0OC41NTQgNy4zNDAxNUMxNTAuMTk2IDUuNjMyMjMgMTUxLjk0MiA0Ljc3ODI2IDE1My43OTQgNC43NzgyNkMxNTUuNjQ2IDQuNzc4MjYgMTU3LjIwMyA1LjAyODIgMTU4LjQ2NiA1LjUyODA4QzE1OS43NzEgNi4wMjc5NyAxNjAuOTI4IDYuNzc3NzkgMTYxLjkzOCA3Ljc3NzU1QzE2NC4yMTEgMTAuMDI3IDE2NS4zNDggMTMuMDY4IDE2NS4zNDggMTYuOTAwNFoiIGZpbGw9IiNBRUE5QTMiLz4KPHBhdGggZD0iTTY0Ljk2NTEgNTkuNjA2NFYzOC44MDgySDU2LjI4NzFWMzMuMTQ2NUg4MC42MDg5VjM4LjgwODJINzEuOTMwOVY1OS42MDY0SDY0Ljk2NTFaIiBmaWxsPSIjQUVBOUEzIi8+CjxwYXRoIGQ9Ik0zMC43ODUyIDU5LjYwNjRWMzMuMTQ2NUg0Ni4zMTIyQzQ4LjI4MzkgMzMuMTQ2NSA0OS45MzEzIDMzLjUxODggNTEuMjU0NCAzNC4yNjM0QzUyLjU3NzUgMzQuOTgyNCA1My41NjMzIDM1Ljk4MzggNTQuMjExOSAzNy4yNjc2QzU0Ljg4NjQgMzguNTI1OCA1NS4yMjM3IDM5LjkzOCA1NS4yMjM3IDQxLjUwNDNDNTUuMjIzNyA0My4xOTg5IDU0LjgyMTYgNDQuNzEzOSA1NC4wMTczIDQ2LjA0OTFDNTMuMjM5MSA0Ny4zNTg2IDUyLjEzNjUgNDguMzg1NiA1MC43MDk2IDQ5LjEzMDNMNTYuMDc5OCA1OS42MDY0SDQ4LjI5NjlMNDMuODYwNiA1MC4yODU3SDM3Ljc1MDlWNTkuNjA2NEgzMC43ODUyWk0zNy43NTA5IDQ1LjE2MzJINDQuOTUwMkM0NS45MTAxIDQ1LjE2MzIgNDYuNjc1NCA0NC44NTUxIDQ3LjI0NjIgNDQuMjM4OEM0Ny44NDI5IDQzLjU5NjkgNDguMTQxMiA0Mi43NDk2IDQ4LjE0MTIgNDEuNjk2OEM0OC4xNDEyIDQxLjAwMzYgNDguMDExNSA0MC40MTMgNDcuNzUyIDM5LjkyNTJDNDcuNDkyNiAzOS40MzczIDQ3LjEyOTQgMzkuMDY1IDQ2LjY2MjQgMzguODA4MkM0Ni4xOTU1IDM4LjUyNTggNDUuNjI0NyAzOC4zODQ1IDQ0Ljk1MDIgMzguMzg0NUgzNy43NTA5VjQ1LjE2MzJaIiBmaWxsPSIjQUVBOUEzIi8+CjxwYXRoIGQ9Ik0wLjMxMTUyMyA1OS42MDY0TDEwLjM1MTYgMzMuMTQ2NUgxOC43MTgzTDI4Ljc1ODMgNTkuNjA2NEgyMS4zMjU2TDE5LjczMDEgNTUuMDIzMUg5LjA2NzM3TDcuNDcxODYgNTkuNjA2NEgwLjMxMTUyM1pNMTAuNzQwNyA0OS44NjIxSDE4LjAxNzhMMTYuMTExIDQ0LjI3NzRDMTYuMDA3MiA0My45OTQ5IDE1Ljg3NzUgNDMuNjQ4MyAxNS43MjE4IDQzLjIzNzVDMTUuNTkyMSA0Mi44MDA5IDE1LjQ0OTQgNDIuMzUxNiAxNS4yOTM4IDQxLjg4OTRDMTUuMTY0IDQxLjQwMTYgMTUuMDM0MyA0MC45MTM3IDE0LjkwNDYgNDAuNDI1OEMxNC43NzQ5IDM5LjkzOCAxNC42NDUyIDM5LjUxNDMgMTQuNTE1NSAzOS4xNTQ4SDE0LjI0MzFDMTQuMTM5MyAzOS42NDI3IDEzLjk4MzYgNDAuMTk0OCAxMy43NzYxIDQwLjgxMUMxMy41OTQ1IDQxLjQyNzIgMTMuMzk5OSA0Mi4wNDM1IDEzLjE5MjQgNDIuNjU5N0MxMy4wMTA4IDQzLjI3NiAxMi44NDIxIDQzLjgxNTIgMTIuNjg2NSA0NC4yNzc0TDEwLjc0MDcgNDkuODYyMVoiIGZpbGw9IiNBRUE5QTMiLz4KPHBhdGggZD0iTTIxMC42NjUgNTkuNjA2NFYzMy4xNDY1SDIzMi43M1YzOC41Mzg2SDIxNy42MzFWNDMuNTA3MUgyMzAuODIzVjQ4Ljc4MzZIMjE3LjYzMVY1NC4yMTQzSDIzMy4wMDJWNTkuNjA2NEgyMTAuNjY1WiIgZmlsbD0iI0FFQTlBMyIvPgo8cGF0aCBkPSJNMTg0LjYyMyA1OS42MDY0VjMzLjE0NjVIMjA2LjY4OFYzOC41Mzg2SDE5MS41ODlWNDMuNTA3MUgyMDQuNzgxVjQ4Ljc4MzZIMTkxLjU4OVY1NC4yMTQzSDIwNi45NlY1OS42MDY0SDE4NC42MjNaIiBmaWxsPSIjQUVBOUEzIi8+CjxwYXRoIGQ9Ik0xNjkuNjY5IDYwLjA2NzlDMTY3Ljk4MyA2MC4wNjc5IDE2Ni40IDU5LjkxMzggMTY0LjkyMiA1OS42MDU3QzE2My40NDMgNTkuMzIzMiAxNjIuMTMzIDU4Ljg0ODIgMTYwLjk5MSA1OC4xODA2QzE1OS44NzYgNTcuNTEzIDE1OC45OTQgNTYuNjQgMTU4LjM0NSA1NS41NjE2QzE1Ny42OTYgNTQuNDU3NSAxNTcuMzcyIDUzLjEwOTUgMTU3LjM3MiA1MS41MTc1QzE1Ny4zNzIgNTEuNDE0OCAxNTcuMzcyIDUxLjI5OTMgMTU3LjM3MiA1MS4xNzA5QzE1Ny4zNzIgNTEuMDQyNSAxNTcuMzg1IDUwLjkzOTggMTU3LjQxMSA1MC44NjI3SDE2NC4xNDNDMTY0LjE0MyA1MC45Mzk4IDE2NC4xMyA1MS4wNDI1IDE2NC4xMDQgNTEuMTcwOUMxNjQuMTA0IDUxLjI3MzYgMTY0LjEwNCA1MS4zNjM0IDE2NC4xMDQgNTEuNDQwNUMxNjQuMTA0IDUyLjI2MjEgMTY0LjMxMiA1Mi45Mjk3IDE2NC43MjcgNTMuNDQzM0MxNjUuMTY4IDUzLjkzMTEgMTY1Ljc3OCA1NC4yOTA2IDE2Ni41NTYgNTQuNTIxN0MxNjcuMzM0IDU0LjcyNzEgMTY4LjI0MiA1NC44Mjk4IDE2OS4yOCA1NC44Mjk4QzE2OS44NTEgNTQuODI5OCAxNzAuMzgzIDU0LjgwNDEgMTcwLjg3NiA1NC43NTI4QzE3MS4zNjggNTQuNzAxNCAxNzEuODA5IDU0LjYxMTYgMTcyLjE5OSA1NC40ODMyQzE3Mi41ODggNTQuMzU0OCAxNzIuOTI1IDU0LjIwMDcgMTczLjIxIDU0LjAyMUMxNzMuNTIyIDUzLjgxNTYgMTczLjc0MiA1My41ODQ1IDE3My44NzIgNTMuMzI3N0MxNzQuMDI4IDUzLjA0NTMgMTc0LjEwNSA1Mi43MjQzIDE3NC4xMDUgNTIuMzY0OEMxNzQuMTA1IDUxLjc3NDMgMTczLjg3MiA1MS4yODY0IDE3My40MDUgNTAuOTAxM0MxNzIuOTY0IDUwLjUxNjEgMTcyLjM1NCA1MC4xOTUyIDE3MS41NzYgNDkuOTM4NEMxNzAuODI0IDQ5LjY4MTYgMTY5Ljk2OCA0OS40Mzc3IDE2OS4wMDggNDkuMjA2NkMxNjguMDQ4IDQ4Ljk3NTUgMTY3LjA0OSA0OC43MzE2IDE2Ni4wMTEgNDguNDc0OEMxNjQuOTczIDQ4LjIxOCAxNjMuOTc1IDQ3Ljg5NzEgMTYzLjAxNSA0Ny41MTE5QzE2Mi4wNTUgNDcuMTI2OCAxNjEuMTg2IDQ2LjYzODkgMTYwLjQwNyA0Ni4wNDg0QzE1OS42NTUgNDUuNDU3OCAxNTkuMDQ1IDQ0LjcyNiAxNTguNTc4IDQzLjg1M0MxNTguMTM3IDQyLjk1NDMgMTU3LjkxNyA0MS44NzU5IDE1Ny45MTcgNDAuNjE3N0MxNTcuOTE3IDM5LjIzMTIgMTU4LjIxNSAzOC4wMzcyIDE1OC44MTIgMzcuMDM1OEMxNTkuNDA5IDM2LjAwODcgMTYwLjIyNiAzNS4xNzQyIDE2MS4yNjQgMzQuNTMyM0MxNjIuMzI3IDMzLjg5MDQgMTYzLjU0NyAzMy40MjgyIDE2NC45MjIgMzMuMTQ1OEMxNjYuMjk3IDMyLjgzNzcgMTY3Ljc2MiAzMi42ODM2IDE2OS4zMTkgMzIuNjgzNkMxNzAuODUgMzIuNjgzNiAxNzIuMjc2IDMyLjgzNzcgMTczLjYgMzMuMTQ1OEMxNzQuOTQ5IDMzLjQ1MzkgMTc2LjE0MiAzMy45NDE4IDE3Ny4xOCAzNC42MDk0QzE3OC4yMTcgMzUuMjUxMyAxNzkuMDIyIDM2LjA3MjkgMTc5LjU5MiAzNy4wNzQzQzE4MC4xODkgMzguMDUgMTgwLjUgMzkuMjMxMiAxODAuNTI2IDQwLjYxNzdWNDEuMDc5OUgxNzMuODMzVjQwLjgxMDNDMTczLjgzMyA0MC4yMTk3IDE3My42NjQgMzkuNzA2MiAxNzMuMzI3IDM5LjI2OTdDMTczLjAxNiAzOC44MDc1IDE3Mi41MzYgMzguNDQ4IDE3MS44ODcgMzguMTkxM0MxNzEuMjM5IDM3LjkwODggMTcwLjQzNSAzNy43Njc2IDE2OS40NzUgMzcuNzY3NkMxNjguNTE1IDM3Ljc2NzYgMTY3LjY5NyAzNy44NTc1IDE2Ny4wMjMgMzguMDM3MkMxNjYuMzc0IDM4LjIxNjkgMTY1Ljg2OCAzOC40NzM3IDE2NS41MDUgMzguODA3NUMxNjUuMTY4IDM5LjE0MTMgMTY0Ljk5OSAzOS41MzkzIDE2NC45OTkgNDAuMDAxNUMxNjQuOTk5IDQwLjU2NjQgMTY1LjIyIDQxLjAyODUgMTY1LjY2MSA0MS4zODhDMTY2LjEyOCA0MS43NDc1IDE2Ni43NTEgNDIuMDU1NiAxNjcuNTI5IDQyLjMxMjRDMTY4LjMwNyA0Mi41NjkyIDE2OS4xNzYgNDIuODEzMSAxNzAuMTM2IDQzLjA0NDJDMTcxLjA5NiA0My4yNDk2IDE3Mi4wODIgNDMuNDgwNyAxNzMuMDk0IDQzLjczNzRDMTc0LjEzMSA0My45Njg1IDE3NS4xMyA0NC4yNzY3IDE3Ni4wOSA0NC42NjE4QzE3Ny4wNSA0NS4wMjEzIDE3Ny45MTkgNDUuNDk2MyAxNzguNjk3IDQ2LjA4NjlDMTc5LjQ3NiA0Ni42NTE4IDE4MC4wODUgNDcuMzU3OSAxODAuNTI2IDQ4LjIwNTJDMTgwLjk5MyA0OS4wNTI1IDE4MS4yMjcgNTAuMDc5NiAxODEuMjI3IDUxLjI4NjRDMTgxLjIyNyA1My4zOTE5IDE4MC43MjEgNTUuMDg2NiAxNzkuNzA5IDU2LjM3MDRDMTc4LjcyMyA1Ny42NTQzIDE3Ny4zNDggNTguNTkxNSAxNzUuNTg0IDU5LjE4MkMxNzMuODQ2IDU5Ljc3MjYgMTcxLjg3NCA2MC4wNjc5IDE2OS42NjkgNjAuMDY3OVoiIGZpbGw9IiNBRUE5QTMiLz4KPC9zdmc+Cg==";

function loadLogoImage(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load logo for watermark"));
    img.src = LOGO_SVG_DATA_URL;
  });
}

export async function addWatermark(imageDataUrl: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      try {
        const logoImg = await loadLogoImage();
        const logoW = logoImg.width;
        const logoH = logoImg.height;
        // Smaller logos: scale down to ~8% of the image dimension
        const scale = Math.max(0.08, Math.min(img.width, img.height) / 1400);
        const tileW = Math.round(logoW * scale);
        const tileH = Math.round(logoH * scale);

        // Generous spacing: 4x the logo width/height between logos
        const spacingX = tileW * 4;
        const spacingY = tileH * 4;

        const patternCanvas = document.createElement("canvas");
        patternCanvas.width = spacingX;
        patternCanvas.height = spacingY;
        const pCtx = patternCanvas.getContext("2d");
        if (!pCtx) {
          resolve(imageDataUrl);
          return;
        }

        const rotationAngle = -20 * (Math.PI / 180);

        // Render white version of logo onto a temp canvas
        const whiteLogoCanvas = document.createElement("canvas");
        whiteLogoCanvas.width = tileW;
        whiteLogoCanvas.height = tileH;
        const wCtx = whiteLogoCanvas.getContext("2d");
        if (wCtx) {
          wCtx.drawImage(logoImg, 0, 0, tileW, tileH);
          wCtx.globalCompositeOperation = "source-in";
          wCtx.fillStyle = "#ffffff";
          wCtx.fillRect(0, 0, tileW, tileH);
          wCtx.globalCompositeOperation = "source-over";
        }
        const whiteLogo = wCtx ? whiteLogoCanvas : logoImg;

        // Two logos per tile: one at top-left area, one offset at center — creates a clean diagonal grid
        const positions = [
          { x: spacingX * 0.15, y: spacingY * 0.15 },
          { x: spacingX * 0.6, y: spacingY * 0.6 },
        ];

        for (const pos of positions) {
          pCtx.save();
          pCtx.translate(pos.x, pos.y);
          pCtx.rotate(rotationAngle);
          // Drop shadow
          pCtx.globalAlpha = 0.15;
          pCtx.shadowColor = "rgba(0, 0, 0, 1)";
          pCtx.shadowBlur = tileH * 0.12;
          pCtx.shadowOffsetX = tileW * 0.02;
          pCtx.shadowOffsetY = tileH * 0.03;
          pCtx.drawImage(whiteLogo, -tileW / 2, -tileH / 2, tileW, tileH);
          // White logo at 50% transparency
          pCtx.shadowColor = "transparent";
          pCtx.shadowBlur = 0;
          pCtx.shadowOffsetX = 0;
          pCtx.shadowOffsetY = 0;
          pCtx.globalAlpha = 0.5;
          pCtx.drawImage(whiteLogo, -tileW / 2, -tileH / 2, tileW, tileH);
          pCtx.restore();
        }

        const pattern = ctx.createPattern(patternCanvas, "repeat");
        if (pattern) {
          ctx.save();
          ctx.globalAlpha = 1;
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      } catch {
        // Fallback to text watermark if logo fails to load
        const watermarkText = "ART & SEE";
        const fontSize = Math.max(16, img.width / 28);
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = fontSize * 0.15;
        ctx.shadowOffsetX = fontSize * 0.04;
        ctx.shadowOffsetY = fontSize * 0.04;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const rotationAngle = -20 * (Math.PI / 180);
        const cols = 3;
        const rows = 4;
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const offsetX = row % 2 === 1 ? cellWidth / 2 : 0;
            const x = cellWidth * col + cellWidth / 2 + offsetX;
            const y = cellHeight * row + cellHeight / 2;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotationAngle);
            ctx.fillText(watermarkText, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      }

      const watermarkedDataUrl = canvas.toDataURL("image/png", 0.92);
      resolve(watermarkedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for watermarking"));
    };

    img.src = imageDataUrl;
  });
}
