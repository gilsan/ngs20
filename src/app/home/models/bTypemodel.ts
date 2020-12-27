import { IAFormVariant, IPatient, IComment, IProfile } from './patients';


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
	comment: IComment[]
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
	///////////////////////////////////////////////
	// 강제로 값넣기
	/*
	if (resultStatus.length === 0) {
		resultStatus = 'detected';
	}
	if (examin.length === 0) {
		examin = '홍길동';
	}
	if (recheck.length === 0) {
		recheck = '장길산';
	}

	if (profile.leukemia.length === 0) {
		profile.leukemia = '-';
	}

	if (profile.flt3itd.length === 0) {
		profile.flt3itd = 'Negative';
	}

	if (profile.chron.length === 0) {
		profile.chron = '46.XY[20]';
	}

	if (acceptdate.length === 0) {
		acceptdate = '20201230';
	}

	if (specimenMessage.length === 0) {
		specimenMessage = '진단시에는 관찰이 되었으나 이번 검사에서는 관찰되지 않았습니다.'
	}

	if (ment.length === 0) {
		ment = 'VUS는 ExAC KRGDB등의 population database에서 관찰되지 않거나, 임상적의의가 불분명 합니다.';
	}

	if (patientInfo.name.length === 0) {
		patientInfo.name = '홍길동';
	}

	if (patientInfo.patientID.length === 0) {
		patientInfo.patientID = '34342810';
	}

	if (patientInfo.gender.length === 0) {
		patientInfo.gender = 'M';
	}

	if (patientInfo.age.length === 0) {
		patientInfo.age = '50';
	}

	if (patientInfo.request.length === 0) {
		patientInfo.request = '장길산';
	}

	if (comment.length === 0) {
		comment = [{
			gene: 'KRAS',
			variants: 'p.Ala146Val',
			comment: 'KRAS 유전자의 돌연변이는 BCP-ALL(16%) 입니다.',
			reference: 'Blood 2013:122:3616-27'
		}];
	}
	*/

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
				<Col id="examdt">검사의뢰일/검사보고일:${acceptdate}/${today}/ - </Col>
				<Col id="examid">검사자:${examin}.M.T.</Col>
				<Col id="signid">판독의사:${recheck}.M.D.</Col>
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
	<Rows>
		<Row>
			<Col id="tg0">CEBPA</Col>
			<Col id="tg1">RUNX1</Col>
			<Col id="tg2">CBL</Col>
			<Col id="tg3">DNMT3A</Col>
			<Col id="tg4">FBXW7</Col>
			<Col id="tg5">JAK1</Col>
			<Col id="tg6">NOTCH1</Col>
			<Col id="tg7">PRAME</Col>
			<Col id="tg8">SF3B1</Col>
			<Col id="tg9">TET2</Col>
		</Row>
		<Row>
			<Col id="tg0">FLT3</Col>
			<Col id="tg1">TP53</Col>
			<Col id="tg2">CDKN2A</Col>
			<Col id="tg3">EGFR</Col>
			<Col id="tg4">GATA1</Col>
			<Col id="tg5">JAK3</Col>
			<Col id="tg6">NOTCH3</Col>
			<Col id="tg7">PTEN</Col>
			<Col id="tg8">SH2B3</Col>
			<Col id="tg9">TPMT</Col>
		</Row>
		<Row>
			<Col id="tg0">IDH1</Col>
			<Col id="tg1">ANKRD26</Col>
			<Col id="tg2">CDKN2B</Col>
			<Col id="tg3">EP300</Col>
			<Col id="tg4">GATA2</Col>
			<Col id="tg5">KRAS</Col>
			<Col id="tg6">NRAS</Col>
			<Col id="tg7">PTPN11</Col>
			<Col id="tg8">SMC1A</Col>
			<Col id="tg9">U2AF1</Col>
		</Row>
		<Row>
			<Col id="tg0">IDH2</Col>
			<Col id="tg1">ASXL1</Col>
			<Col id="tg2">CHK1</Col>
			<Col id="tg3">ERG</Col>
			<Col id="tg4">GATA3</Col>
			<Col id="tg5">KMT2A</Col>
			<Col id="tg6">NT5C2</Col>
			<Col id="tg7">RAD21</Col>
			<Col id="tg8">SMC3</Col>
			<Col id="tg9">WT1</Col>
		</Row>
		<Row>
			<Col id="tg0">JAK2</Col>
			<Col id="tg1">BCOR</Col>
			<Col id="tg2">CREBBP</Col>
			<Col id="tg3">ETV6</Col>
			<Col id="tg4">HNRNPK</Col>
			<Col id="tg5">MPL</Col>
			<Col id="tg6">PAX5</Col>
			<Col id="tg7">RB1</Col>
			<Col id="tg8">SRSF2</Col>
			<Col id="tg9">ZRSR2</Col>
		</Row>
		<Row>
			<Col id="tg0">KIT</Col>
			<Col id="tg1">BRAF</Col>
			<Col id="tg2">CSF3R</Col>
			<Col id="tg3">EZH2</Col>
			<Col id="tg4">IKZF1</Col>
			<Col id="tg5">MYC</Col>
			<Col id="tg6">PDGFRA</Col>
			<Col id="tg7">SETBP1</Col>
			<Col id="tg8">STAG2</Col>
			<Col id="tg9"></Col>
		</Row>
		<Row>
			<Col id="tg0">NPM1</Col>
			<Col id="tg1">CALR</Col>
			<Col id="tg2">DDX41</Col>
			<Col id="tg3">FAN5C</Col>
			<Col id="tg4">IL7R</Col>
			<Col id="tg5">NF1</Col>
			<Col id="tg6">PHF6</Col>
			<Col id="tg7">SETD2</Col>
			<Col id="tg8">TERT</Col>
			<Col id="tg9"></Col>
		</Row>
	</Rows>
</Dataset>

</root>
`;


	return patient + variantHeader + data + variantBottom + comments + fixedMent;

}


