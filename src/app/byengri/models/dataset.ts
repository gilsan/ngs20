import { IAmplification, IBasicInfo, IExtraction, IFusion, IIAmplification, IMutation } from './patients';


export function makeReport(
  examedno: string,        // 검사자 번호
  examedname: string,      // 검사자 이름
  checkeredno: string,     // 확인자 번호
  checkername: string,     // 확인자 이름
  dnarna: string,
  organ: string,
  basicInfo: IBasicInfo,
  extraction: IExtraction,
  mutations: IMutation[],
  amplification: IAmplification[],
  fusion: IFusion[],
  iimutation: IMutation[],
  iamplification: IIAmplification[],
  iifusion: IFusion[],
  tumorMutationalBurden: string,
  msiScore: string,
  generalReport: string,
  specialment: string,
  notement: string
): string {

  // null 처리
  if (tumorMutationalBurden === null) {
    tumorMutationalBurden = '';
  }


  const todays = () => {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '.' + newmon + '.' + newday;

    return now;
  };

  const reportDate = todays();

  let mutationData = '';
  let amplificationData = '';
  let fusionData = '';
  if (specialment.length > 0) {
    const items = specialment.split('\n');
    if (items.length === 2) {
      mutationData = items[0];
      fusionData = items[1];
    } else if (items.length === 3) {
      mutationData = items[0];
      amplificationData = items[1];
      fusionData = items[2];
    }
  }

  const extractionContent = `
    <root>
        <Dataset id="ds_data1">
          <ColumnInfo>
            <Column id="pid" type="STRING" size="256"/>
            <Column id="hngnm" type="STRING" size="256"/>
            <Column id="agesex" type="STRING" size="256"/>
            <Column id="ptno" type="STRING" size="256"/>
            <Column id="dnaandrnaextraction" type="STRING" size="256"/>
            <Column id="relptno" type="STRING" size="256"/>
            <Column id="keyblock" type="STRING" size="256"/>
            <Column id="tumorcellpercentage" type="STRING" size="256"/>
            <Column id="organ" type="STRING" size="256"/>
            <Column id="tumortype" type="STRING" size="256"/>
            <Column id="pathologicaldiagnosis" type="STRING" size="256"/>
            <Column id="execprcpuniqno" type="STRING" size="256"/>
            <Column id="reptdt" type="STRING" size="256"/>
			      <Column id="examid" type="STRING" size="256"/>
			      <Column id="examnm" type="STRING" size="256"/>
			      <Column id="checkid" type="STRING" size="256"/>
			      <Column id="checknm" type="STRING" size="256"/>
          </ColumnInfo>
          <Rows>
            <Row>
              <Col id="pid">${basicInfo.registerNum}</Col>
              <Col id="hngnm">${basicInfo.name}</Col>
              <Col id="agesex">${basicInfo.age}/${basicInfo.gender}</Col>
              <Col id="ptno">${basicInfo.pathologyNum}</Col>
              <Col id="dnaandrnaextraction">${extraction.dnarna}</Col>
              <Col id="relptno">${extraction.managementNum}</Col>
              <Col id="keyblock">${extraction.keyblock}</Col>
              <Col id="tumorcellpercentage">${extraction.tumorcellpercentage}</Col>
              <Col id="organ">${extraction.organ}</Col>
              <Col id="tumortype">${extraction.tumortype}</Col>
              <Col id="pathologicaldiagnosis">${extraction.diagnosis}</Col>
              <Col id="execprcpuniqno">1234567890123456789</Col>
              <Col id="reptdt" >${reportDate}</Col>
			        <Col id="examid" >${examedno}</Col>
			        <Col id="examnm" >${examedname}</Col>
			        <Col id="checkid">${checkeredno}</Col>
			        <Col id="checknm">${checkername}</Col>
            </Row>
          </Rows>
        </Dataset>
    `;

  const mutationHeader = `
    <Dataset id="ds_data2_1">
    <ColumnInfo>
      <Column id="gene" type="STRING" size="256"/>
      <Column id="aminoacid" type="STRING" size="256"/>
      <Column id="nucleotide" type="STRING" size="256"/>
      <Column id="variantallelefrequency" type="STRING" size="256"/>
      <Column id="id" type="STRING" size="256"/>
      <Column id="tier" type="STRING" size="256"/>
    </ColumnInfo>`;

  let mutaionContent = '';

  if (mutations.length) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < mutations.length; i++) {
      mutaionContent = mutaionContent + `
          <Row>
             <Col id="gene">${mutations[i].gene}</Col>
             <Col id="aminoacid">${mutations[i].aminoAcidChange}</Col>
             <Col id="nucleotide">${mutations[i].nucleotideChange}</Col>
             <Col id="variantallelefrequency">${mutations[i].variantAlleleFrequency}</Col>
             <Col id="id">${mutations[i].ID}</Col>
             <Col id="tier">${mutations[i].tier}</Col>
           </Row>
        `;
    }
    mutaionContent = ` <Rows>
      ${mutaionContent}
      </Rows>`;
  }
  const mutationBottom = `
  </Dataset>
   `;
  const mutationValue = mutationHeader + mutaionContent + mutationBottom;

  const amplicationHeader = `
    <Dataset id="ds_data2_2">
    <ColumnInfo>
      <Column id="gene" type="STRING" size="256"/>
      <Column id="region" type="STRING" size="256"/>
      <Column id="estimated" type="STRING" size="256"/>
      <Column id="tier" type="STRING" size="256"/>
    </ColumnInfo>
    `;

  let amplificationContent = '';
  if (amplification.length) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < amplification.length; i++) {
      amplificationContent = amplificationContent + `
        <Row>
           <Col id="gene">${amplification[i].gene}</Col>
           <Col id="region">${amplification[i].region}</Col>
           <Col id="estimated">${amplification[i].copynumber}</Col>
           <Col id="tier">${amplification[i].tier}</Col>
         </Row>
      `;
    }
    amplificationContent = `<Rows>
      ${amplificationContent}
      </Rows>
    `;
  }

  const amplificationBottom = `</Dataset>`;
  const amplificationValue = amplicationHeader + amplificationContent + amplificationBottom;

  const fusionHeader = `
   <Dataset id="ds_data2_3">
   <ColumnInfo>
     <Column id="geneexon"   type="STRING" size="256"/>
     <Column id="breakpoint" type="STRING" size="256"/>
     <Column id="function"   type="STRING" size="256"/>
     <Column id="tier"      type="STRING" size="256"/>
   </ColumnInfo>
   `;

  let fusionContent = '';
  if (fusion.length) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < fusion.length; i++) {
      fusionContent = fusionContent + `
      <Row>
        <Col id="geneexon">${fusion[i].gene}</Col>
        <Col id="breakpoint">${fusion[i].breakpoint}</Col>
        <Col id="function">${fusion[i].functions}</Col>
        <Col id="tier">${fusion[i].tier}</Col>
     </Row>
      `;
    }
    fusionContent = `<Rows>
      ${fusionContent}
      </Rows>
    `;
  }

  const fusionBottom = `</Dataset>`;
  const fusionValue = fusionHeader + fusionContent + fusionBottom;

  const imutationHeader = `
  <Dataset id="ds_data3_1">
  <ColumnInfo>
    <Column id="gene" type="STRING" size="256"/>
    <Column id="aminoacid" type="STRING" size="256"/>
    <Column id="nucleotide" type="STRING" size="256"/>
    <Column id="variantallelefrequency" type="STRING" size="256"/>
    <Column id="id" type="STRING" size="256"/>
    <Column id="note" type="STRING" size="256"/>
  </ColumnInfo>`;

  let imutaionContent = '';

  if (iimutation.length) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < iimutation.length; i++) {
      imutaionContent = imutaionContent + `
        <Row>
           <Col id="gene">${iimutation[i].gene}</Col>
           <Col id="aminoacid">${iimutation[i].aminoAcidChange}</Col>
           <Col id="nucleotide">${iimutation[i].nucleotideChange}</Col>
           <Col id="variantallelefrequency">${iimutation[i].variantAlleleFrequency}</Col>
           <Col id="id">${iimutation[i].ID}</Col>
           <Col id="note">${iimutation[i].tier}</Col>
         </Row>
      `;
    }
    imutaionContent = `<Rows>
        ${imutaionContent}
      </Rows>
    `;
  }
  const imutationBottom = `
  </Dataset>`;
  const imutationValue = imutationHeader + imutaionContent + imutationBottom;



  const iamplificationHeader = `
    <Dataset id="ds_data3_2">
       <ColumnInfo>
       <Column id="gene" type="STRING" size="256"/>
       <Column id="region" type="STRING" size="256"/>
       <Column id="esticopynum" type="STRING" size="256"/>
       <Column id="note" type="STRING" size="256"/>
       </ColumnInfo>
    `

  let iamplificationContent = '';
  if (iamplification.length) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < iamplification.length; i++) {
      iamplificationContent = iamplificationContent + `
      <Row>
      <Col id="gene">${iamplification[i].gene}</Col>
      <Col id="region">${iamplification[i].region}</Col>
      <Col id="esticopynum">${iamplification[i].copynumber}</Col>
      <Col id="note">${iamplification[i].note}</Col>
      </Row>
      `;
    }

    iamplificationContent = `<Rows>
    ${iamplificationContent}
    </Rows>
    `;
  }

  const iamplificationBottom = `</Dataset>`;
  const iamplificationValue = iamplificationHeader + iamplificationContent + iamplificationBottom;



  const ifusionHeader = `
   <Dataset id="ds_data3_3">
   <ColumnInfo>
     <Column id="geneexon"   type="STRING" size="256"/>
     <Column id="breakpoint" type="STRING" size="256"/>
     <Column id="function"   type="STRING" size="256"/>
     <Column id="note"      type="STRING" size="256"/>
   </ColumnInfo>
   `;

  let ifusionContent = '';
  // console.log('[263][]', iifusion);
  if (iifusion.length) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < iifusion.length; i++) {
      ifusionContent = ifusionContent + `
      <Row>
        <Col id="geneexon">${iifusion[i].gene}</Col>
        <Col id="breakpoint">${iifusion[i].breakpoint}</Col>
        <Col id="function">${iifusion[i].functions}</Col>
        <Col id="note">${iifusion[i].tier}</Col>
     </Row>`;
    }
    ifusionContent = `<Rows>
    ${ifusionContent}
     </Rows>
    `;

  }

  const ifusionBottom = `</Dataset>`;
  // console.log('[284][]', ifusionContent);
  const ifusionValue = ifusionHeader + ifusionContent + ifusionBottom;

  const tumor = `
    <Dataset id="ds_data4">
    <ColumnInfo>
       <Column id="tumor" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
      <Row>
         <Col id="tumor">${tumorMutationalBurden}</Col>
      </Row>
    </Rows>
  </Dataset>`;

  const msiscore = `
    <Dataset id="ds_data5">
    <ColumnInfo>
       <Column id="msiscore" type="STRING" size="256"/>
    </ColumnInfo>
    <Rows>
      <Row>
         <Col id="msiscore">${msiScore} (MSS)</Col>
      </Row>
    </Rows>
  </Dataset>
    `;


  const essential = `
  <Dataset id="ds_data6">
    <ColumnInfo>
      <Column id="essential" type="STRING" size="256"/>
    </ColumnInfo>
      <Rows>
         <Row>
            <Col id="essential">
  - Mutation: ERBB2,IDH1,IDH2,NTRK1,NTRK3,TSC1,TSC2
  - Amplification: KRAS
  - Fusion / Exon variant: NTRK1, NTRK2, NTRK3
            </Col>
         </Row>
      </Rows>
  </Dataset>
  `;

  const restpart = `
    <Dataset id="ds_data6">
       <ColumnInfo>
          <Column id="mutation" type="STRING" size="256"/>
          <Column id="amplification" type="STRING" size="256"/>
          <Column id="fusion" type="STRING" size="256"/>
          <Column id="note" type="STRING" size="256"/>
       </ColumnInfo>
       <Rows>
          <Row>
              <Col id="mutation">${mutationData}</Col>
              <Col id="amplification">${amplificationData}</Col>
              <Col id="fusion">${fusionData}</Col>
              <Col id="note">${notement}</Col>
          </Row>
       </Rows>
    </Dataset>
    <Dataset id="ds_data7">
       <ColumnInfo>
          <Column id="commenttitle" type="STRING" size="256"/>
          <Column id="comments" type="STRING" size="256"/>
       </ColumnInfo>
       <Rows>
          <Row>
             <Col id="commenttitle">해석적보고</Col>
             <Col id="comments">${generalReport}</Col>
          </Row>
       </Rows>
    </Dataset>
    <Dataset  id="ds_data8">
       <ColumnInfo>
          <Column id="testinfocontent" type="STRING" size="256"/>
       </ColumnInfo>
       <Rows>
           <Row>
              <Col id="testinfocontent">1. 검사시약
  Oncomine Comprehensive Assay plus (ThermoFisher scientific)
  2. 검사기기
  Ion S5 XL sequencer (ThermoFisher scientific)
  Ion CHEF (ThermoFisher scientific)
  3. Reference genome: hg19
  4. 분석 소프트웨어
  Torrent suite v5.10.2
  Ion Reporter v5.12
  Oncomine knowledgebase reporter v4.7
  5. 돌연변이 검출 기준치
  Minimum allele frequency of hotspot variant: ≥ 4%
  Minimum allele frequency of indel variant: ≥ 5%
  Minimum allele frequency of SNP variant: ≥ 5%
  Minimum read counts for fusions: ≥ 40
  CNV gain threshold: 4
  Gain confidence level: 0.05
  Max fold difference for loss: 0.7
  6. Tier classification (Reference: J Mol Diagn. 2017 Jan;19(1):4-23.)
  (1) I
  Biomarker predicts response or resistance to EMA or FDA approved therapies in thipe
  Biomarker is included in ESMO or NCCN guidelines that predict response or resistance to
  therapies in this cancer type
  (2) II
  Biomarker predicts response or resistance to EMA or FDA approved therapies in other cancer types
  Biomarker is included in ESMO or NCCN guidelines that predict response or resistance to
  therapies in other cancer types
  Biomarker is an inclusion criteria for clinical trials
  [Comment]
  상기 검사 방법, 시약의 정도 관리 및 검사 결과는 병리과 전문의에 의해 확인되었습니다.
  상기 검사는 종양조직만을 이용하기 때문에 도출된 염기서열 변이가 생식세포 변이인지 체세포 변이
  인지 구분이 어렵습니다.
  돌연변이가 존재하더라도 검출 기준치 미만인 경우 검출이 어려울 수 있습니다.
              </Col>
           </Row>
       </Rows>
    </Dataset>
    <Dataset  id="ds_data9">
       <ColumnInfo>
          <Column id="targetgenelist"  type="STRING" size="256"/>
          <Column id="targetgenetitle" type="STRING" size="256"/>
       </ColumnInfo>
       <Rows>
          <Row>
             <Col id="targetgenelist"> 타겟 유전자 목록</Col>
             <Col id="targetgenetitle">Oncomine Comprehensive Assay plus (ThermoFisher scientific)</Col>
          </Row>
       </Rows>
    </Dataset>
</root>
  `;

  // tslint:disable-next-line: max-line-length
  return extractionContent + mutationValue + amplificationValue + fusionValue + imutationValue + iamplificationValue + ifusionValue + tumor + msiscore + restpart;

  /*
      <Dataset id="ds_data10">
        <ColumnInfo>
          <Column id="genename"  type="STRING" size="256"/>
          <Column id="genelist" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
               <Col id="genename">Hotspot genes (165개)</Col>
               <Col id="genelist">
                    <color="false">ACVR1</color>
                    <color="false">ATP1A1</color>
                    <color="false">BCR</color>
                    <color="false">BMP5</color>
                    <color="false">BTK</color>
                    <color="false">CACNA1D</color>
                    <color="false">CD79B</color>
                    <color="false">CSF1R</color>
                    <color="false">CTNNB1</color>
                    <color="false">CUL1</color>
                    <color="false">CYSLTR2</color>
                    <color="false">DGCR8</color>
                    <color="false">DROSHA</color>
                    <color="false">E2F1</color>
                    <color="false">EPAS1</color>
                    <color="false">FGF7</color>
                    <color="false">FOXL2</color>
                    <color="false">FOXO1</color>
                    <color="false">GLI1</color>
                    <color="false">GNA11</color>
                    <color="false">GNAQ</color>
                    <color="false">HIF1A</color>
                    <color="false">HIST1H2BD</color>
                    <color="false">HIST1H3B</color>
                    <color="false">HRAS</color>
                    <color="false">IDH1</color>
                    <color="false">IL6ST</color>
                    <color="false">IRF4</color>
                    <color="false">IRS4</color>
                    <color="false">KLF4</color>
                    <color="false">KNSTRN</color>
                    <color="false">MAP2K2</color>
                    <color="false">MED12</color>
                    <color="false">MYOD1</color>
                    <color="false">NSD2</color>
                    <color="false">NT5C2</color>
                    <color="false">NTRK2</color>
                    <color="false">NUP93</color>
                    <color="false">PAX5</color>
                    <color="false">PIK3CD</color>
                    <color="false">PIK3CG</color>
                    <color="false">PTPRD</color>
                    <color="false">RGS7</color>
                    <color="false">RHOA</color>
                    <color="false">RPL10</color>
                    <color="false">SIX1</color>
                    <color="false">SIX2</color>
                    <color="false">SNCAIP</color>
                    <color="false">SOS1</color>
                    <color="false">SOX2</color>
                    <color="false">SRSF2</color>
                    <color="false">STAT5B</color>
                    <color="false">TAF1</color>
                    <color="false">TGFBR1</color>
                    <color="false">TRRAP</color>
                    <color="false">TSHR</color>
                    <color="false">WAS</color>
                    <color="true">+ CNV</color>
                    <color="true">ABL1</color>
                    <color="true">ABL2</color>
                    <color="true">AKT1</color>
                    <color="true">AKT2</color>
                    <color="true">AKT3</color>
                    <color="true">ALK</color>
                    <color="true">AR</color>
                    <color="true">ARAF</color>
                    <color="true">AURKA</color>
                    <color="true">AURKC</color>
                    <color="true">AXL</color>
                    <color="true">BCL2</color>
                    <color="true">BCL2L12</color>
                    <color="true">BCL6</color>
                    <color="true">BRAF</color>
                    <color="true">CARD11</color>
                    <color="true">CBL</color>
                    <color="true">CCND1</color>
                    <color="true">CCND2</color>
                    <color="true">CCND3</color>
                    <color="true">CCNE1</color>
                    <color="true">CDK4</color>
                    <color="true">CDK6</color>
                    <color="true">CHD4</color>
                    <color="true">DDR2</color>
                    <color="true">EGFR</color>
                    <color="true">EIF1AX</color>
                    <color="true">ERBB2</color>
                    <color="true">ERBB3</color>
                    <color="true">ERBB4</color>
                    <color="true">ESR1</color>
                    <color="true">EZH2</color>
                    <color="true">FAM135B</color>
                    <color="true">FGFR1</color>
                    <color="true">FGFR2</color>
                    <color="true">FGFR3</color>
                    <color="true">FGFR4</color>
                    <color="true">FLT3</color>
                    <color="true">FLT4</color>
                    <color="true">FOXA1</color>
                    <color="true">GATA2</color>
                    <color="true">GNAS</color>
                    <color="true">H3F3A</color>
                    <color="true">H3F3B</color>
                    <color="true">IDH2</color>
                    <color="true">IKBKB</color>
                    <color="true">IL7R</color>
                    <color="true">KDR</color>
                    <color="true">KIT</color>
                    <color="true">KLF5</color>
                    <color="true">KRAS</color>
                    <color="true">MAGOH</color>
                    <color="true">MAP2K1</color>
                    <color="true">MAPK1</color>
                    <color="true">MAX</color>
                    <color="true">MDM4</color>
                    <color="true">+MECOM</color>
                    <color="true">MEF2B</color>
                    <color="true">MET</color>
                    <color="true">MITF</color>
                    <color="true">MPL</color>
                    <color="true">MTOR</color>
                    <color="true">MYC</color>
                    <color="true">MYCN</color>
                    <color="true">MYD88</color>
                    <color="true">NFE2L2</color>
                    <color="true">NRAS</color>
                    <color="true">NTRK1</color>
                    <color="true">NTRK3</color>
                    <color="true">PCBP1</color>
                    <color="true">PDGFRA</color>
                    <color="true">PDGFRB</color>
                    <color="true">PIK3C2B</color>
                    <color="true">PIK3CA</color>
                    <color="true">PIK3CB</color>
                    <color="true">PIK3R2</color>
                    <color="true">PIM1</color>
                    <color="true">PLCG1</color>
                    <color="true">PPP2R1A</color>
                    <color="true">PPP6C</color>
                    <color="true">PRKACA</color>
                    <color="true">PTPN11</color>
                    <color="true">PXDNL</color>
                    <color="true">RAC1</color>
                    <color="true">RAF1</color>
                    <color="true">RARA</color>
                    <color="true">RET</color>
                    <color="true">RHEB</color>
                    <color="true">RICTOR</color>
                    <color="true">RIT1 </color>
                    <color="true">ROS1</color>
                    <color="true">SETBP1</color>
                    <color="true">SF3B1</color>
                    <color="true">SLCO1B3</color>
                    <color="true">SMC1A</color>
                    <color="true">SMO</color>
                    <color="true">SPOP</color>
                    <color="true">SRC</color>
                    <color="true">STAT3</color>
                    <color="true">STAT6</color>
                    <color="true">TERT</color>
                    <color="true">TOP1</color>
                    <color="true">TPMT</color>
                    <color="true">U2AF1</color>
                    <color="true">USP8</color>
                    <color="true">XPO1</color>
                    <color="true">ZNF217</color>
                    <color="true">ZNF429</color>
                </Col>
            </Row>
      </Rows>
      </Dataset>
      <Dataset   id="ds_data12">
        <ColumnInfo>
          <Column id="genename"  type="STRING" size="256"/>
          <Column id="genelist1" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
               <Col id="genename">Full-coding DNA sequence (227개)</Col>
               <Col id="gen"elist>
                    <color="false">CALR</color>
                    <color="false">CIITA</color>
                    <color="false">CYP2D6</color>
                    <color="false">ERCC5</color>
                    <color="false">FAS</color>
                    <color="false">ID3</color>
                    <color="false">KLHL13</color>
                    <color="false">MTUS2</color>
                    <color="false">PSMB10</color>
                    <color="false">PSMB8</color>
                    <color="false">PSMB9</color>
                    <color="false">RNASEH2C</color>
                    <color="false">RPL22</color>
                    <color="false">RPL5</color>
                    <color="false">RUNX1T1</color>
                    <color="false">SDHC</color>
                    <color="false">SOCS1</color>
                    <color="false">STAT1</color>
                    <color="false">TMEM132D</color>
                    <color="false">UGT1A1</color>
                    <color="false">ZBTB20</color>
                    <color="true">+ CNV Loss</color>
                    <color="true">ABRAXAS1</color>
                    <color="true">ACVR1B</color>
                    <color="true">ACVR2A</color>
                    <color="true">ADAMTS12</color>
                    <color="true">ADAMTS2</color>
                    <color="true">AMER1</color>
                    <color="true">APC</color>
                    <color="true">ARHGAP35</color>
                    <color="true">ARID1A</color>
                    <color="true">ARID1B</color>
                    <color="true">ARID2</color>
                    <color="true">ARID5B</color>
                    <color="true">ASXL1</color>
                    <color="true">ASXL2</color>
                    <color="true">ATM</color>
                    <color="true">ATR</color>
                    <color="true">ATRX</color>
                    <color="true">AXIN1</color>
                    <color="true">AXIN2</color>
                    <color="true">B2M</color>
                    <color="true">BAP1</color>
                    <color="true">BARD1</color>
                    <color="true">BCOR</color>
                    <color="true">BLM</color>
                    <color="true">BMPR2</color>
                    <color="true">BRCA1</color>
                    <color="true">BRCA2</color>
                    <color="true">BRIP1</color>
                    <color="true">CASP8</color>
                    <color="true">CBFB</color>
                    <color="true">CD274</color>
                    <color="true">CD276</color>
                    <color="true">CDC73</color>
                    <color="true">CDH1</color>
                    <color="true">CDH10</color>
                    <color="true">CDK12</color>
                    <color="true">CDKN1A</color>
                    <color="true">CDKN1B</color>
                    <color="true">CDKN2A</color>
                    <color="true">CDKN2B</color>
                    <color="true">CDKN2C</color>
                    <color="true">CHEK1</color>
                    <color="true">CHEK2</color>
                    <color="true">CIC</color>
                    <color="true">CREBBP</color>
                    <color="true">CSMD3</color>
                    <color="true">CTCF</color>
                    <color="true">CTLA4</color>
                    <color="true">CUL3</color>
                    <color="true">CUL4A</color>
                    <color="true">CUL4B</color>
                    <color="true">CYLD</color>
                    <color="true">CYP2C9</color>
                    <color="true">DAXX</color>
                    <color="true">DDX3X</color>
                    <color="true">DICER1</color>
                    <color="true">DNMT3A</color>
                    <color="true">DOCK3</color>
                    <color="true">DPYD</color>
                    <color="true">DSC1</color>
                    <color="true">DSC3</color>
                    <color="true">ELF3</color>
                    <color="true">ENO1</color>
                    <color="true">EP300</color>
                    <color="true">EPCAM</color>
                    <color="true">EPHA2</color>
                    <color="true">ERAP1</color>
                    <color="true">ERAP2</color>
                    <color="true">ERCC2</color>
                    <color="true">ERCC4</color>
                    <color="true">ERRFI1</color>
                    <color="true">ETV6</color>
                    <color="true">FANCA</color>
                    <color="true">FANCC</color>
                    <color="true">FANCD2</color>
                    <color="true">FANCE</color>
                    <color="true">FANCF</color>
                    <color="true">FANCG</color>
                    <color="true">FANCI</color>
                    <color="true">FANCL</color>
                    <color="true">FANCM</color>
                    <color="true">FAT1</color>
                    <color="true">FBXW7</color>
                    <color="true">FUBP1</color>
                    <color="true">GATA3</color>
                    <color="true">GNA13</color>
                    <color="true">GPS2</color>
                    <color="true">HDAC2</color>
                    <color="true">HDAC9</color>
                    <color="true">HLA-A</color>
                    <color="true">HLA-B</color>
                    <color="true">HNF1A</color>
                    <color="true">INPP4B</color>
                    <color="true">JAK1</color>
                    <color="true">JAK2</color>
                    <color="true">JAK3</color>
                    <color="true">KDM5C</color>
                    <color="true">KDM6A</color>
                    <color="true">KEAP1</color>
                    <color="true">KMT2A</color>
                    <color="true">KMT2B</color>
                    <color="true">KMT2C</color>
                    <color="true">KMT2D</color>
                    <color="true">LARP4B</color>
                    <color="true">LATS1</color>
                    <color="true">LATS2</color>
                    <color="true">MAP2K4</color>
                    <color="true">MAP2K7</color>
                    <color="true">MAP3K1</color>
                    <color="true">MAP3K4</color>
                    <color="true">MAPK8</color>
                    <color="true">MEN1</color>
                    <color="true">MGA</color>
                    <color="true">MLH1</color>
                    <color="true">MLH3</color>
                    <color="true">MRE11</color>
                    <color="true">MSH2</color>
                    <color="true">MSH3</color>
                    <color="true">MSH6</color>
                    <color="true">MTAP</color>
                    <color="true">MUTYH</color>
                    <color="true">NBN</color>
                    <color="true">NCOR1</color>
                    <color="true">NF1</color>
                    <color="true">NF2</color>
                    <color="true">NOTCH1</color>
                    <color="true">NOTCH2</color>
                    <color="true">NOTCH3</color>
                    <color="true">NOTCH4</color>
                    <color="true">PALB2</color>
                    <color="true">PARP1</color>
                    <color="true">PARP2</color>
                    <color="true">PARP3</color>
                    <color="true">PARP4</color>
                    <color="true">PBRM1</color>
                    <color="true">PDCD1</color>
                    <color="true">PDCD1LG2</color>
                    <color="true">PDIA3</color>
                    <color="true">PGD</color>
                    <color="true">PHF6</color>
                    <color="true">PIK3R1</color>
                    <color="true">PMS1</color>
                    <color="true">PMS2</color>
                    <color="true">POLD1</color>
                    <color="true">POLE</color>
                    <color="true">POT1</color>
                    <color="true">PPM1D</color>
                    <color="true">PPP2R2A</color>
                    <color="true">PRDM1</color>
                    <color="true">PRKM9</color>
                    <color="true">PRKAR1A</color>
                    <color="true">PTCH1</color>
                    <color="true">PTEN </color>
                    <color="true">PTPRT</color>
                    <color="true">RAD50</color>
                    <color="true">RAD51</color>
                    <color="true">RAD51B</color>
                    <color="true">RAD51C</color>
                    <color="true">RAD51D</color>
                    <color="true">RAD52</color>
                    <color="true">RAD54L</color>
                    <color="true">RASA1</color>
                    <color="true">RASA2</color>
                    <color="true">RB1</color>
                    <color="true">RBM10</color>
                    <color="true">RECQL4</color>
                    <color="true">RNASEH2A</color>
                    <color="true">RNASEH2B</color>
                    <color="true">RNF43</color>
                    <color="true">RPA1</color>
                    <color="true">RUNX1</color>
                    <color="true">MLH1</color>
                    <color="true">SDHA</color>
                    <color="true">SDHB</color>
                    <color="true">SDHD</color>
                    <color="true">SETD2</color>
                    <color="true">SLX4</color>
                    <color="true">SMAD2</color>
                    <color="true">SMAD4</color>
                    <color="true">SMARCA4</color>
                    <color="true">SMARCB1</color>
                    <color="true">SOX9</color>
                    <color="true">SPEN</color>
                    <color="true">STAG2</color>
                    <color="true">STK11</color>
                    <color="true">SUFU</color>
                    <color="true">TAP1</color>
                    <color="true">TAP2</color>
                    <color="true">TBX3</color>
                    <color="true">TCF7L2</color>
                    <color="true">TET2</color>
                    <color="true">TGFBR2</color>
                    <color="true">TNFAIP3</color>
                    <color="true">TNFRSF14</color>
                    <color="true">TP53</color>
                    <color="true">TP63</color>
                    <color="true">TPP2</color>
                    <color="true">TSC1</color>
                    <color="true">TSC2</color>
                    <color="true">USP9X</color>
                    <color="true">VHL</color>
                    <color="true">WT1</color>
                    <color="true">XRCC2</color>
                    <color="true">XRCC3</color>
                    <color="true">ZFHX3</color>
                    <color="true">ZMYM3</color>
                    <color="true">ZRSR2</color>
                </Col>
            </Row>
        </Rows>
      </Dataset>
      <Dataset   id="ds_data13">
        <ColumnInfo>
          <Column id="genename"  type="STRING" size="256"/>
          <Column id="genelist1" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
           <Row>
              <Col id="genename">CNV gain only (19개)</Col>
               <Col id="genelist">
                    <color="false">ABCB1</color>
                    <color="false">CTNND2</color>
                    <color="false">DDR1</color>
                    <color="false">EMSY</color>
                    <color="false">FGF19</color>
                    <color="false">FGF23</color>
                    <color="false">FGF3</color>
                    <color="false">FGF4</color>
                    <color="false">FGF9</color>
                    <color="false">FYN</color>
                    <color="false">GLI3</color>
                    <color="false">IGF1R</color>
                    <color="false">MCL1</color>
                    <color="false">MDM2</color>
                    <color="false">MYCL</color>
                    <color="false">RPS6KB1</color>
                    <color="false">RPTOR</color>
                    <color="false">YAP1</color>
                    <color="false">YES1</color>
               </Col>
          </Row>
        </Rows>
      </Dataset>
      <Dataset   id="ds_data14">
        <ColumnInfo>
          <Column id="genename"  type="STRING" size="256"/>
          <Column id="genelist1" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
           <Row>
              <Col  id="genename">Fusion (51개)</Col>
               <Col id="genelist">
                  <color="false">AKT2</color>
                  <color="false">ALK</color>
                  <color="false">AR</color>
                  <color="false">AXL</color>
                  <color="false">BRAF</color>
                  <color="false">BRCA1</color>
                  <color="false">BRCA2</color>
                  <color="false">CDKN2A</color>
                  <color="false">EGFR</color>
                  <color="false">ERBB2</color>
                  <color="false">ERBB4</color>
                  <color="false">ERG</color>
                  <color="false">ESR1</color>
                  <color="false">ETV1</color>
                  <color="false">ETV4</color>
                  <color="false">ETV5</color>
                  <color="false">FGFR1</color>
                  <color="false">FGFR2</color>
                  <color="false">FGFR3</color>
                  <color="false">FGR</color>
                  <color="false">FLT3</color>
                  <color="false">JAK2</color>
                  <color="false">KRAS</color>
                  <color="false">MDM4</color>
                  <color="false">MET</color>
                  <color="false">MYB</color>
                  <color="false">MYBL1</color>
                  <color="false">NF1</color>
                  <color="false">NOTCH1</color>
                  <color="false">NOTCH4</color>
                  <color="false">NTRK1</color>
                  <color="false">NTRK2</color>
                  <color="false">NTRK3</color>
                  <color="false">NUTM1</color>
                  <color="false">PDGFRA</color>
                  <color="false">PDGFRB</color>
                  <color="false">PIK3CA</color>
                  <color="false">PPARG</color>
                  <color="false">PRKACA</color>
                  <color="false">PRKACB </color>
                  <color="false">PTEN</color>
                  <color="false">RAD51B</color>
                  <color="false">RAF1</color>
                  <color="false">RB1</color>
                  <color="false">RELA</color>
                  <color="false">RET</color>
                  <color="false">ROS1</color>
                  <color="false">RSPO2</color>
                  <color="false">RSPO3</color>
                  <color="false">TERT</color>
               </Col>
          </Row>
        </Rows>
      </Dataset>
      <Dataset   id="ds_data15">
        <ColumnInfo>
          <Column id="genename"  type="STRING" size="256"/>
          <Column id="genelist1" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
           <Row>
              <Col id="genename">TMB only genes (86개)</Col>
               <Col id="genelist">
                  <color="false">A1CF</color>
                  <color="false">ACSM2B</color>
                  <color="false">ADAM18</color>
                  <color="false">ANO4</color>
                  <color="false">ARMC4</color>
                  <color="false">BRINP3</color>
                  <color="false">C6</color>
                  <color="false">C8A</color>
                  <color="false">C8B</color>
                  <color="false">CANX</color>
                  <color="false">CASR</color>
                  <color="false">CD163</color>
                  <color="false">CNTN6</color>
                  <color="false">CNTNAP4</color>
                  <color="false">NTNAP5</color>
                  <color="false">COL11A1</color>
                  <color="false">DCAF4L2</color>
                  <color="false">DCDC1</color>
                  <color="false">GALNT17</color>
                  <color="false">GPR158</color>
                  <color="false">GRID2</color>
                  <color="false">HCN1</color>
                  <color="false">HLA-C</color>
                  <color="false">KCND2</color>
                  <color="false">KCNH7</color>
                  <color="false">KEL</color>
                  <color="false">KIR3DL1</color>
                  <color="false">KRTAP2-1</color>
                  <color="false">KRTAP6-2</color>
                  <color="false">LRRC7</color>
                  <color="false">MARCO</color>
                  <color="false">NLRC5</color>
                  <color="false">NOL4</color>
                  <color="false">NRXN1</color>
                  <color="false">NYAP2</color>
                  <color="false">OR10G8</color>
                  <color="false">OR2G6</color>
                  <color="false">OR2L13</color>
                  <color="false">OR2L2</color>
                  <color="false">OR2L8</color>
                  <color="false">OR2M3</color>
                  <color="false">OR2T3</color>
                  <color="false">OR2T33</color>
                  <color="false">OR2T4</color>
                  <color="false">OR2W3</color>
                  <color="false">OR4A15</color>
                  <color="false">OR4C15</color>
                  <color="false">OR4C6</color>
                  <color="false">OR4M1</color>
                  <color="false">OR4M2</color>
                  <color="false">OR5D18</color>
                  <color="false">OR5F1</color>
                  <color="false">OR5L1</color>
                  <color="false">OR5L2</color>
                  <color="false">OR6F1</color>
                  <color="false">OR8H2</color>
                  <color="false">OR8I2</color>
                  <color="false">OP8U1</color>
                  <color="false">ORC4</color>
                  <color="false">PAK5</color>
                  <color="false">PCDH17</color>
                  <color="false">PDE1A</color>
                  <color="false">PDE1C</color>
                  <color="false">PLXDC2</color>
                  <color="false">POM121L12</color>
                  <color="false">PPFIA2</color>
                  <color="false">RBP3</color>
                  <color="false">REG1A</color>
                  <color="false">REG1B</color>
                  <color="false">REG3A</color>
                  <color="false">REG3G</color>
                  <color="false">RPTN</color>
                  <color="false">RUNDC3B</color>
                  <color="false">SH3RF2</color>
                  <color="false">SLC15A2</color>
                  <color="false">SLC8A1</color>
                  <color="false">SYT10</color>
                  <color="false">SYT16</color>
                  <color="false">TAPBP</color>
                  <color="false">TPTE</color>
                  <color="false">TRHDE</color>
                  <color="false">TRIM48</color>
                  <color="false">TRIM51</color>
                  <color="false">ZIM3</color>
                  <color="false">ZNF479</color>
                  <color="false">ZNF536</color>
               </Col>"
          </Row>
        </Rows>
      </Dataset>
      <Dataset id="ds_data17">
        <ColumnInfo>
          <Column id="comment"  type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
           <Row>
              <Col id="comment">
    본 검사는 위 목록의 약 500 여개 유전자에 대한 검출 알고리즘을 사용하며,
    포함되지 않은 유전자에 대 해서는 별도의 추가 검사가 필요할 수 있습니다.
              </Col>
           </Row>
        </Rows>
      </Dataset>
    </root>

  */

}





