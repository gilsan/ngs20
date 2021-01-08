import { IAFormVariant, IPatient, IComment, IProfile, IGeneList } from './patients';


export const METHODS = 'Total genomic DNA was extracted from the each sample. Template and automated libraries were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences to the reference human genome (GRCh37/hg19) and base calling were performed using the Torrent Suite software version 5.8.0 (Thermo Fisher Scientific). The Torrent Variant Caller v5.8.0.19 (Thermo Fisher Scientific) was used for calling variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.6. ';


export const GENERAL = 'The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.';


export function makeBForm(
	resultStatus: string, // detected, not detected
	examin: string, // 검사자
	recheck: string, // 확인자
	profile: IProfile,
	acceptdate: string,
	specimenMessage: string,
	fusion: string,
	ment: string,
	patientInfo: IPatient,
	formData: IAFormVariant[],
	comment: IComment[],
	firstReportDay: string,
	lastReportDay: string,
	genelists: IGeneList[]
): string {

	// 금일날자:
	function formatDate(date): any {
		const d = new Date(date);
		let month = '' + (d.getMonth() + 1);
		let day = '' + d.getDate();
		const year = d.getFullYear();

		if (month.length < 2) {
			month = '0' + month;
		}

		if (day.length < 2) {
			day = '0' + day;
		}

		return [year, month, day].join('.');
	}

	const today = formatDate(new Date());
	examin = examin.slice(0, -2);
	recheck = recheck.slice(0, -2);
	///////////////////////////////////////////////
	// 강제로 값넣기


	// 검사의뢰일은 db에 accept_date
	// 검사보고일은 당일
	// 수정보고일 현재는 "-""
	/////////////////////////////////////////////////////
	const patient = `<root>
	<Dataset id="ds_1">
	    <ColumnInfo>
			<Column id="patient" type="STRING" size="256"/>
			<Column id="result" type="STRING" size="256"/>
			<Column id="rsltleft1" type="STRING" size="256"/>
			<Column id="rsltleft2" type="STRING" size="256"/>
			<Column id="rsltcenter1" type="STRING" size="256"/>	
			<Column id="rsltcenter2" type="STRING" size="256"/>	
			<Column id="rsltright1" type="STRING" size="256"/>
			<Column id="rsltright2" type="STRING" size="256"/>
			<Column id="testinfo1" type="STRING" size="256"/>
			<Column id="testinfo2" type="STRING" size="256"/>
			<Column id="testinfo3" type="STRING" size="256"/>
			<Column id="testinfo4" type="STRING" size="256"/>
			<Column id="opnion" type="STRING" size="256"/>
			<Column id="title" type="STRING" size="256"/>
			<Column id="examdt" type="STRING" size="256"/>
			<Column id="examid" type="STRING" size="256"/>
			<Column id="signid" type="STRING" size="256"/>
		</ColumnInfo>
		<Rows>
			<Row>
				<Col id="patient">${patientInfo.name}, ${patientInfo.patientID} (${patientInfo.gender}/${patientInfo.age})</Col>
				<Col id="result">${resultStatus}</Col>
				<Col id="rsltleft1">Leukemia associated fusion</Col>
				<Col id="rsltleft2">${profile.leukemia}</Col>
				<Col id="rsltcenter1">FLT3-ITD</Col>
				<Col id="rsltcenter2">${profile.flt3itd}</Col>
				<Col id="rsltright1">Chromosomal analysis</Col>
				<Col id="rsltright2">${profile.chron}</Col>
				<Col id="testinfo1">TARGET DISEASE: Acute myeloid leukemia</Col>
				<Col id="testinfo2">METHOD: *Massively parallel sequencing</Col>
				<Col id="testinfo3">SPECIMEN:  ${specimenMessage}</Col>
				<Col id="testinfo4">REQUEST: ${patientInfo.request}</Col>
				<Col id="opnion">${ment}</Col>
				<Col id="title">Acute Myeloid Leukemia NGS</Col>
				<Col id="examdt">${acceptdate}/${firstReportDay}/${lastReportDay}</Col>
				<Col id="examid">${examin}</Col>
				<Col id="signid">${recheck}</Col>
			</Row>
		</Rows>
	</Dataset>
	`;

	const variantHeader = `
	<Dataset id="ds_2">
	<ColumnInfo>
		<Column id="gene" type="STRING" size="256"/>
		<Column id="fimpact" type="STRING" size="256"/>
		<Column id="transcript" type="STRING" size="256"/>
		<Column id="exonintron" type="STRING" size="256"/>
		<Column id="nuclchange" type="STRING" size="256"/>
		<Column id="aminochange" type="STRING" size="256"/>
		<Column id="zygosity" type="STRING" size="256"/>
		<Column id="vaf" type="STRING" size="256"/>
		<Column id="reference" type="STRING" size="256"/>
		<Column id="cosmicid" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
	`;

	let data = '';
	// tslint:disable-next-line: prefer-for-of
	for (let i = 0; i < formData.length; i++) {
		data = data + `
			<Row>
			 <Col id="gene">${formData[i].gene}</Col>
			 <Col id="fimpact">${formData[i].functionalImpact}</Col>
			 <Col id="transcript">${formData[i].transcript}</Col>
			 <Col id="exonintron">${formData[i].exonIntro}</Col>
			 <Col id="nuclchange">${formData[i].nucleotideChange}</Col>
			 <Col id="aminochange">${formData[i].aminoAcidChange}</Col>
			 <Col id="zygosity">${formData[i].zygosity}</Col>
			 <Col id="vaf">${formData[i].vafPercent}</Col>
			 <Col id="reference">${formData[i].references}</Col>
			 <Col id="cosmicid">${formData[i].cosmicID}</Col>
		 </Row>
			`;
	}


	const variantBottom = `
		</Rows>
</Dataset>
	`;


	const commentHeader = `
<Dataset id="ds_3">
	<ColumnInfo>
		<Column id="gene" type="STRING" size="256"/>
		<Column id="variants" type="STRING" size="256"/>
		<Column id="comments" type="STRING" size="256"/>
		<Column id="reference" type="STRING" size="256"/>
	</ColumnInfo>
`;

	let commentContent = '';
	// tslint:disable-next-line: prefer-for-of
	for (let i = 0; i < comment.length; i++) {
		commentContent = commentContent + `
		<Row>
		<Col id="gene">${comment[i].gene}</Col>
		<Col id="variants">${comment[i].variant_id}</Col>
		<Col id="comments">${comment[i].comment}</Col>
		<Col id="reference">${comment[i].reference}</Col>
	</Row>`;
	}

	commentContent = `<Rows>
		${commentContent}
		</Rows>
	`;
	const commentBottom = `
	</Dataset>
	`;
	const comments = commentHeader + commentContent + commentBottom;

	const fixedMent = `
	<Dataset id="ds_4">
	<ColumnInfo>
		<Column id="methods" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
		<Row>
			<Col id="methods">Total genomic DNA was extracted from the each sample. Template and automated libraries were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences to the reference human genome (GRCh37/hg19) and base calling were performed using the Torrent Suite software version 5.8.0 (Thermo Fisher Scientific). The Torrent Variant Caller v5.8.0.19 (Thermo Fisher Scientific) was used for calling variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.6.</Col>
		</Row>
	</Rows>
</Dataset>

<Dataset id="ds_5">
	<ColumnInfo>
		<Column id="technique" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>
		<Row>
			<Col id="technique">The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.</Col>
		</Row>
	</Rows>
</Dataset>

<Dataset id="ds_6">
	<ColumnInfo>
		<Column id="tg0" type="STRING" size="256"/>
		<Column id="tg1" type="STRING" size="256"/>
		<Column id="tg2" type="STRING" size="256"/>
		<Column id="tg3" type="STRING" size="256"/>
		<Column id="tg4" type="STRING" size="256"/>
		<Column id="tg5" type="STRING" size="256"/>
		<Column id="tg6" type="STRING" size="256"/>
		<Column id="tg7" type="STRING" size="256"/>
		<Column id="tg8" type="STRING" size="256"/>
		<Column id="tg9" type="STRING" size="256"/>
	</ColumnInfo>
	<Rows>`;

	let list = '';

	// tslint:disable-next-line:no-unused-expression
	genelists.forEach(gene => {
		list = list + `
		<Row>
			<Col id="tg0">${gene.g0}</Col>
			<Col id="tg1">${gene.g1}</Col>
			<Col id="tg2">${gene.g2}</Col>
			<Col id="tg3">${gene.g3}</Col>
			<Col id="tg4">${gene.g4}</Col>
			<Col id="tg5">${gene.g5}</Col>
			<Col id="tg6">${gene.g6}</Col>
			<Col id="tg7">${gene.g7}</Col>
			<Col id="tg8">${gene.g8}</Col>
			<Col id="tg9">${gene.g9}</Col>
		</Row>
		`;
	});

	const rootbottom = `</Rows>
	</Dataset>
</root>`;



	return patient + variantHeader + data + variantBottom + comments + fixedMent + list + rootbottom;

}


